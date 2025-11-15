import { addToWatchlist, removeFromWatchlist } from "@/api/watchlist";
import AssetChart from "@/app/charts/asset-chart";
import TransactionButtons from "@/app/transaction-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Minus, Plus } from "lucide-react";
import React from "react";
import { AssetSheetPopoverProps, Transaction } from "@/types/custom-types";
import { useTransactionType } from "@/api/asset";
import { getTransactionsByAsset } from "@/api/transaction";
import { formatTimestampShort } from "@/utils/format-timestamp";
import { Badge } from "@/components/ui/badge";

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
  setPageAssetInWatchlist,
}) => {
  const [transactionType, setTransactionType] = useTransactionType();
  const user_id = localStorage.getItem("user_id");
  const [transactionHistory, setTransactionHistory] = React.useState<
    Transaction[]
  >([]);

  React.useEffect(() => {
    if (user_id) {
      getTransactionsByAsset(user_id, pageAsset.id, setTransactionHistory);
    }
  }, []);

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
          />
        </div>
        <Button
          onClick={() => {
            if (pageAssetInWatchlist) {
              removeFromWatchlist(user_id, pageAsset?.id);
              setPageAssetInWatchlist(false);
            } else {
              addToWatchlist(user_id, pageAsset?.id);
              setPageAssetInWatchlist(true);
            }
          }}
          variant="outline"
        >
          {pageAssetInWatchlist ? <Minus /> : <Plus />}
          {pageAssetInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
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
      {transactionHistory.length > 0 ? (
        <div className={"grid w-full grid-cols-3"}>
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
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export { AssetPage };
