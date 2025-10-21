import { Asset } from "@/api/asset";
import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";

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
    console.error("Error fetching watchlist:", apiError);
    toast("There was an error fetching your watchlist.");
  }
};

export const addToWatchlist = async (
  user_id: string | null,
  asset_id: number | undefined,
) => {
  if (!user_id || !asset_id) return;

  try {
    await apiClient.post("/watchlist/", null, {
      params: {
        user_id,
        asset_id,
      },
    });
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Failed to add asset to watchlist:", apiError);
    toast("Failed to add asset to watchlist.");
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
    console.error("Failed to remove asset from watchlist:", apiError);
    toast("Failed to remove asset from watchlist.");
  }
};
