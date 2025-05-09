import { Asset } from "@/api/asset";

export const getWatchlist = async (
  user_id: string | null,
  setWatchlistAssets: (assets: Asset[]) => void,
) => {
  const response = await fetch(`http://localhost:8000/watchlist/${user_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  setWatchlistAssets(data);
};

export const addToWatchlist = async (
  user_id: string | null,
  asset_id: number | undefined,
) => {
  if (!user_id || !asset_id) return;
  const response = await fetch(
    `http://localhost:8000/watchlist/?user_id=${user_id}&asset_id=${asset_id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    console.error("Failed to add asset to watchlist");
  }
};
