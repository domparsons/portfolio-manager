import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { Asset } from "@/types/custom-types";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

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
    await apiClient.delete("/watchlist/remove_from_watchlist", {
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

export const useWatchlistAlerts = () => {
  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  useEffect(() => {
    const checkAlerts = async () => {
      const lastChecked = sessionStorage.getItem("alerts_last_checked");
      const today = new Date().toISOString().split("T")[0];

      if (lastChecked === today || !user_id) {
        return;
      }

      try {
        const response = await apiClient.get(`/watchlist/alerts/${user_id}`);
        const alerts = await response;

        alerts.forEach((alert: { ticker: any; change_pct: number }) => {
          const isPositive = alert.change_pct > 0;
          const direction = isPositive ? "📈" : "📉";
          const change = isPositive ? "higher" : "lower";
          toast(
            `${direction} ${alert.ticker} closed ${Math.abs(alert.change_pct * 100).toFixed(2)}% ${change} than the previous trading day`,
          );
        });

        sessionStorage.setItem("alerts_last_checked", today);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
        toast.error("Failed to load watchlist alerts");
      }
    };

    checkAlerts();
  }, [user_id]);
};
