import React from "react";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";
import { Asset, Portfolio } from "@/types/custom-types";
import { format } from "date-fns";

export function useTransactionType() {
  return React.useState<"buy" | "sell">("buy");
}

export const getAssetList = async () => {
  try {
    return await apiClient.get<Asset[]>("/asset/asset_list");
  } catch (error) {
    const apiError = error as ApiError;

    console.error("Asset list fetch failed:", {
      status: apiError.status,
      error: apiError.message,
    });

    throw apiError;
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

export interface AssetInWatchlist {
  asset_in_watchlist: boolean;
  alert_percentage: number;
}

export const checkAssetInWatchlist = async (
  ticker: string | undefined,
  user_id: string | null,
): Promise<AssetInWatchlist | undefined> => {
  if (!ticker || !user_id) return undefined;

  try {
    return await apiClient.get<AssetInWatchlist>(
      "/asset/check_asset_in_watchlist",
      {
        params: {
          ticker,
          user_id,
        },
      },
    );
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching asset data:", apiError);
    toast("There was an error fetching asset data.");
  }
};

export const saveAlertsChange = async (
  assetId: number | undefined,
  user_id: string | null,
  enablePriceAlerts: boolean,
  assetAlertPercentage: number,
) => {
  if (assetId === undefined || user_id === null) {
    toast.error("An error occurred.");
    return;
  }

  try {
    await apiClient.post("/asset/watchlist_alerts", null, {
      params: {
        asset_id: assetId,
        user_id: user_id,
        enable_price_alerts: enablePriceAlerts,
        asset_alert_percentage: assetAlertPercentage,
      },
    });

    toast.success("Alert settings updated successfully");
  } catch (error) {
    console.error("Failed to update alert settings:", error);
    toast.error("Failed to update alert settings");
    throw error;
  }
};

export const getPriceOnDate = async (date: Date, asset_id: number | null) => {
  const stringDate = format(date, "yyyy-MM-dd");
  try {
    return await apiClient.get<number>(
      `/asset/price_on_date?asset_id=${asset_id}&date=${stringDate}`,
    );
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching asset price on date:", apiError);
    toast("There was an error fetching asset price on date.");
  }
};
