import {
  checkAssetInWatchlist,
  getAssetByTicker,
  getTimeseriesDataForAsset,
} from "@/api/asset";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AssetPage } from "./asset-page";
import { Asset, Portfolio } from "@/types/custom-types";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const AssetPageWrapper = () => {
  const { ticker } = useParams();
  const [pageAsset, setPageAsset] = useState<Asset | null>(null);
  const [pageAssetAlertPercentage, setPageAssetAlertPercentage] = useState<
    number | undefined
  >();
  const [pageAssetInWatchlist, setPageAssetInWatchlist] = useState<
    boolean | undefined
  >(undefined);
  const [timeseries, setTimeseries] = useState<Portfolio[]>([]);
  const [timeseriesRange, setTimeseriesRange] = useState<string>("1Y");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const fetchData = async () => {
    if (!ticker) {
      setError("No ticker provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const asset = await getAssetByTicker(ticker);

      if (!asset) {
        setError(`Asset "${ticker}" not found`);
        return;
      }

      setPageAsset(asset);

      if (user_id) {
        const assetInWatchlist = await checkAssetInWatchlist(ticker, user_id);
        setPageAssetInWatchlist(assetInWatchlist?.asset_in_watchlist);
        setPageAssetAlertPercentage(
          assetInWatchlist?.alert_percentage
            ? assetInWatchlist.alert_percentage * 100
            : undefined,
        );
      }

      await getTimeseriesDataForAsset(asset.id, setTimeseries, timeseriesRange);
    } catch (error) {
      const apiError = error as ApiError;

      console.error("Failed to load asset page:", {
        ticker,
        error: apiError.message,
        status: apiError.status,
      });

      if (apiError.status === 404) {
        setError(`Asset "${ticker}" not found`);
        toast.error("Asset not found");
      } else if (apiError.status >= 500) {
        setError("Server error. Please try again in a moment.");
        toast.error("Failed to load asset data");
      } else {
        setError("Failed to load asset data");
        toast.error("Failed to load asset data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ticker, timeseriesRange, user_id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner className={"size-5"} />
          <p className="text-gray-500">Loading asset data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Failed to Load Asset</h3>
                <p className="text-gray-600 mt-2">{error}</p>
              </div>
              <Button onClick={fetchData} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pageAsset) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-gray-600">No asset data available</p>
              <Button onClick={fetchData} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AssetPage
      pageAsset={pageAsset}
      timeseries={timeseries}
      timeseriesRange={timeseriesRange}
      setTimeseriesRange={setTimeseriesRange}
      pageAssetInWatchlist={pageAssetInWatchlist}
      pageAssetAlertPercentage={pageAssetAlertPercentage}
      setPageAssetInWatchlist={setPageAssetInWatchlist}
    />
  );
};

export default AssetPageWrapper;
