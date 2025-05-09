import { Asset } from "@/api/asset";
import { getWatchlist } from "@/api/watchlist";
import { TableSkeleton } from "@/app/table-skeleton";
import { WatchlistTable } from "@/app/watchlist/watchlist-table";
import React, { useState } from "react";

const Watchlist = () => {
  const [watchlistAssets, setWatchlistAssets] = useState<Asset[]>([]);
  const user_id = localStorage.getItem("user_id");

  React.useEffect(() => {
    getWatchlist(user_id, setWatchlistAssets);
  }, []);

  return (
    <div className="watchlist">
      {" "}
      <h1 className="text-2xl font-semibold">Watchlist</h1>
      {watchlistAssets.length === 0 ? <TableSkeleton /> : <WatchlistTable filteredAssets={watchlistAssets} />}
      {" "}
    </div>
  );
};

export { Watchlist };
