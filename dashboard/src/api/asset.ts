import React from "react";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";
import { Asset, Portfolio } from "@/types/custom-types";

export function useTransactionType() {
  return React.useState<"buy" | "sell">("buy");
}

export const getAssetList = async (
  setAssets: (assets: Asset[]) => void,
  setFilteredAssets: (assets: Asset[]) => void,
) => {
  try {
    const data = await apiClient.get<Asset[]>("/asset/asset_list");
    setAssets(data);
    setFilteredAssets(data);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching asset data:", apiError);
    toast("There was an error fetching asset data.");
  }
};

export const getTimeseriesDataForAsset = async (
  assetId: number,
  setTimeseries: (data: Portfolio[]) => void,
  timeseriesRange: string,
) => {
  try {
    const data = await apiClient.get<Portfolio[]>(
      "/timeseries/timeseries_for_asset",
      {
        params: {
          asset_id: assetId,
          timeseries_range: timeseriesRange,
        },
      },
    );
    setTimeseries(data);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching asset data:", apiError);
    toast("There was an error fetching asset data.");
  }
};

export const getAssetByTicker = async (ticker: string | undefined) => {
  if (!ticker) return;

  try {
    return await apiClient.get<Asset>("/asset/get_asset_by_ticker", {
      params: { ticker },
    });
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching asset data:", apiError);
    toast("There was an error fetching asset data.");
  }
};

export const checkAssetInWatchlist = async (
  ticker: string | undefined,
  user_id: string | null,
) => {
  if (!ticker || !user_id) return;

  try {
    return await apiClient.get<boolean>("/asset/check_asset_in_watchlist/", {
      params: {
        ticker,
        user_id,
      },
    });
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching asset data:", apiError);
    toast("There was an error fetching asset data.");
  }
};
