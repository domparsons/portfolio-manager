import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { Asset } from "@/types/custom-types";

export const getWatchlist = async (
  user_id: string | null,
  setWatchlistAssets: (assets: Asset[]) => void,
  setFilteredWatchlistAssets: (assets: Asset[]) => void,
) => {
  if (!user_id) return;

  try {
    const data = await apiClient.get<Asset[]>(`/watchlist/${user_id}`);
    setWatchlistAssets(data);
    setFilteredWatchlistAssets(data);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      toast.error("User not found");
    } else {
      toast.error("Failed to fetch watchlist");
    }
  }
};

export const addToWatchlist = async (
  user_id: string | null,
  asset_id: number | undefined,
) => {
  if (!user_id || !asset_id) return;

  try {
    await apiClient.post("/watchlist/add_to_watchlist", null, {
      params: {
        user_id,
        asset_id,
      },
    });
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      toast.error("Asset not found");
    } else {
      toast.error("Failed to add to watchlist");
    }
  }
};

export const removeFromWatchlist = async (
  user_id: string | null,
  asset_id: number | undefined,
) => {
  if (!user_id || !asset_id) return;

  try {
    await apiClient.delete("/watchlist/remove_from_watchlist/", {
      params: {
        user_id,
        asset_id,
      },
    });
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      toast.error("Watchlist item not found");
    } else {
      toast.error("Failed to remove from watchlist");
    }
  }
};
