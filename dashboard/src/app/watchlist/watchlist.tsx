import { getWatchlist } from "@/api/watchlist";
import { TableSkeleton } from "@/app/table-skeleton";
import React, { useState } from "react";
import { AssetTable } from "@/app/assets/asset-table";
import { AssetSearch } from "@/app/assets/asset-search";
import { Asset } from "@/types/custom-types";

const Watchlist = () => {
  const [watchlistAssets, setWatchlistAssets] = useState<Asset[]>([]);
  const [filteredWatchlistAssets, setFilteredWatchlistAssets] = useState<
    Asset[]
  >([]);
  const user_id = localStorage.getItem("user_id");

  React.useEffect(() => {
    getWatchlist(user_id, setWatchlistAssets, setFilteredWatchlistAssets);
  }, []);

  return (
    <div className="watchlist">
      {" "}
      <h1 className="text-2xl font-semibold">Watchlist</h1>
      {watchlistAssets.length === 0 ? (
        <TableSkeleton />
      ) : (
        <div>
          <AssetSearch
            assets={watchlistAssets}
            setFilteredAssets={setFilteredWatchlistAssets}
            searchListName={"watchlist"}
          />
          {filteredWatchlistAssets.length === 0 ? (
            <TableSkeleton />
          ) : (
            <AssetTable filteredAssets={filteredWatchlistAssets} />
          )}
        </div>
      )}
    </div>
  );
};

export { Watchlist };
