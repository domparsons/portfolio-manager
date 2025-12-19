import AssetChart from "@/app/charts/asset-chart";
import TransactionButtons from "@/app/transactions/transaction-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Minus, Plus } from "lucide-react";
import React from "react";
import { AssetSheetPopoverProps, Transaction } from "@/types/custom-types";
import { saveAlertsChange, useTransactionType } from "@/api/asset";
import { getTransactionsByAsset } from "@/api/transaction";
import { formatTimestampShort } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { useAuth0 } from "@auth0/auth0-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-client";
import { addToWatchlist, removeFromWatchlist } from "@/api/watchlist";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const AssetDetail: React.FC<{
  label: string;
  value: string | number;
  className?: string;
}> = ({ label, value, className }) => (
  <div className="flex flex-col space-y-1 items-center justify-center">
    <p className="font-light text-sm">{label}</p>
    <p className={`font-semibold text-xl ${className || ""}`}>{value}</p>
  </div>
);

const AssetPage: React.FC<AssetSheetPopoverProps> = ({
  pageAsset,
  timeseries,
  timeseriesRange,
  setTimeseriesRange,
  pageAssetInWatchlist,
  pageAssetAlertPercentage,
  setPageAssetInWatchlist,
}) => {
  const [transactionType, setTransactionType] = useTransactionType();
  const [transactionHistory, setTransactionHistory] = React.useState<
    Transaction[]
  >([]);
  const [enablePriceAlerts, setEnablePriceAlerts] =
    React.useState<boolean>(false);
  const [displayAssetAlertPercentage, setDisplayAssetAlertPercentage] =
    React.useState<number>(0);
  const [watchlistAction, setWatchlistAction] = React.useState<
    "add" | "remove" | null
  >(null);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [isWatchlistLoading, setIsWatchlistLoading] =
    React.useState<boolean>(false);

  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const refreshTransactionHistory = React.useCallback(() => {
    if (user_id) {
      getTransactionsByAsset(pageAsset.id, setTransactionHistory);
    }
  }, [user_id, pageAsset.id]);

  const handleUpdateAlert = async () => {
    setIsSaving(true);

    try {
      await saveAlertsChange(
        pageAsset.id,
        user_id,
        enablePriceAlerts,
        displayAssetAlertPercentage,
      );
    } catch (error) {
      const apiError = error as ApiError;

      console.error("Alert update failed:", {
        asset: pageAsset.ticker,
        error: apiError.message,
        status: apiError.status,
      });

      if (apiError.status === 404) {
        setPageAssetInWatchlist(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleWatchlistToggle = async () => {
    setIsWatchlistLoading(true);

    const isCurrentlyInWatchlist = pageAssetInWatchlist;
    const action = isCurrentlyInWatchlist ? "remove" : "add";
    setWatchlistAction(action);

    setPageAssetInWatchlist(!isCurrentlyInWatchlist);

    try {
      if (isCurrentlyInWatchlist) {
        await removeFromWatchlist(pageAsset?.id);
        toast.success(`${pageAsset.ticker} removed from watchlist`);
      } else {
        await addToWatchlist(pageAsset?.id);
        toast.success(`${pageAsset.ticker} added to watchlist`);
      }
    } catch (error) {
      setPageAssetInWatchlist(isCurrentlyInWatchlist);

      const apiError = error as ApiError;
      console.error(`Failed to ${action} watchlist item:`, {
        asset: pageAsset.ticker,
        action,
        error: apiError.message,
      });

      if (apiError.status === 404) {
        toast.error("Asset not found. Please refresh the page.");
      } else if (apiError.status === 500) {
        toast.error("Server error. Please try again in a moment.");
      } else {
        toast.error(`Failed to ${action} ${pageAsset.ticker} from watchlist`);
      }
    } finally {
      setIsWatchlistLoading(false);
      setWatchlistAction(null);
    }
  };

  React.useEffect(() => {
    refreshTransactionHistory();
  }, [refreshTransactionHistory]);

  React.useEffect(() => {
    if (pageAssetAlertPercentage) {
      setEnablePriceAlerts(true);
      setDisplayAssetAlertPercentage(pageAssetAlertPercentage);
    } else {
      setEnablePriceAlerts(false);
      setDisplayAssetAlertPercentage(0);
    }
  }, [pageAssetAlertPercentage]);

  return (
    <>
      <div
        className={"flex flex-row space-x-6 mt-4 items-center justify-between"}
      >
        <div className={"flex flex-row space-x-6 items-center"}>
          <h1 className="text-2xl font-semibold">{pageAsset?.asset_name}</h1>
          <TransactionButtons
            transactionType={transactionType}
            setTransactionType={setTransactionType}
            asset={pageAsset}
            onTransactionSuccess={refreshTransactionHistory}
          />
        </div>
        <Button
          onClick={handleWatchlistToggle}
          variant="outline"
          disabled={isWatchlistLoading}
        >
          {isWatchlistLoading ? (
            <>
              <Spinner className={"size-5"} />
              {watchlistAction === "remove" ? "Removing..." : "Adding..."}
            </>
          ) : (
            <>
              {pageAssetInWatchlist ? <Minus /> : <Plus />}
              {pageAssetInWatchlist
                ? "Remove from watchlist"
                : "Add to watchlist"}
            </>
          )}
        </Button>
      </div>
      {timeseries.length > 0 ? (
        <Card>
          <CardHeader className={"flex flex-row items-center justify-between"}>
            <CardTitle>{pageAsset?.latest_price.toFixed(2)}</CardTitle>
            <Tabs defaultValue={timeseriesRange} className="w-[250px]">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="1M"
                  onClick={() => setTimeseriesRange("1M")}
                >
                  1M
                </TabsTrigger>
                <TabsTrigger
                  value="3M"
                  onClick={() => setTimeseriesRange("3M")}
                >
                  3M
                </TabsTrigger>
                <TabsTrigger
                  value="1Y"
                  onClick={() => setTimeseriesRange("1Y")}
                >
                  1Y
                </TabsTrigger>{" "}
                <TabsTrigger
                  value="ALL"
                  onClick={() => setTimeseriesRange("ALL")}
                >
                  ALL
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 max-w-full overflow-hidden">
            <AssetChart data={timeseries} />
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-gray-500">
          No data available for this asset.
        </div>
      )}
      <Card>
        <CardContent
          className={
            "flex flex- space-x-6 items-center justify-around p-4 w-full"
          }
        >
          <AssetDetail
            label="Market Cap"
            value={pageAsset?.market_cap.toLocaleString("en-US", {
              notation: "compact",
            })}
          />
          <AssetDetail
            label="Latest Value"
            value={pageAsset?.latest_price.toFixed(2)}
          />
          <AssetDetail
            label="Daily Price Change"
            value={pageAsset?.price_change.toFixed(2)}
            className={
              (pageAsset?.price_change ?? 0) > 0
                ? "text-green-600"
                : "text-red-600"
            }
          />
          <AssetDetail
            label="Daily % Change"
            value={pageAsset?.percentage_change.toFixed(2)}
            className={
              (pageAsset?.percentage_change ?? 0) > 0
                ? "text-green-600"
                : "text-red-600"
            }
          />
          <AssetDetail label="Currency" value={pageAsset?.currency} />
        </CardContent>
      </Card>
      <div className={"grid w-full grid-cols-3 gap-4"}>
        {transactionHistory.length > 0 ? (
          <Card className={"col-span-1"}>
            <CardHeader>
              <CardTitle>
                Transaction History for {pageAsset.asset_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {transactionHistory.map((transaction, index) => (
                  <div key={index} className="flex justify-between">
                    <span className={"font-bold"}>{transaction.ticker}</span>
                    <div className={"flex gap-4 "}>
                      <span className={"font-light"}>
                        {formatTimestampShort(transaction.timestamp)}
                      </span>
                      $
                      {parseFloat(
                        (transaction.quantity * transaction.price).toFixed(2),
                      )}
                      <Badge variant={transaction.type}>
                        {transaction.type === "buy" ? "Buy" : "Sell"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <></>
        )}
        {pageAssetInWatchlist && (
          <Card className={"col-span-1"}>
            <CardHeader>
              <CardTitle>Alerts for {pageAsset.asset_name}</CardTitle>
            </CardHeader>
            <CardContent className={"space-y-4"}>
              <div className={"flex items-center space-x-3"}>
                <Switch
                  checked={enablePriceAlerts}
                  onCheckedChange={(checked) => setEnablePriceAlerts(checked)}
                />
                <Label>Enable price alerts</Label>
              </div>

              <div className={"flex flex-row items-center space-x-3"}>
                <Label>Alert threshold</Label>
                <Input
                  value={displayAssetAlertPercentage}
                  className={"w-16"}
                  onChange={(e) =>
                    setDisplayAssetAlertPercentage(Number(e.target.value))
                  }
                />
                <div>%</div>
              </div>
              <Button onClick={handleUpdateAlert} disabled={isSaving}>
                {isSaving ? "Saving..." : "Update Alert"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export { AssetPage };
