import { getWatchlist } from "@/api/watchlist";
import { TableSkeleton } from "@/app/table-skeleton";
import React, { useState } from "react";
import { AssetTable } from "@/app/assets/asset-table";
import { AssetSearch } from "@/app/assets/asset-search";
import { Asset } from "@/types/custom-types";
import { EmptyComponent } from "@/app/empty-component";
import { useAuth0 } from "@auth0/auth0-react";

const Watchlist = () => {
  const [watchlistAssets, setWatchlistAssets] = useState<Asset[]>([]);
  const [filteredWatchlistAssets, setFilteredWatchlistAssets] = useState<
    Asset[]
  >([]);
  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  React.useEffect(() => {
    getWatchlist(user_id, setWatchlistAssets, setFilteredWatchlistAssets);
  }, []);

  return (
    <div className="watchlist">
      {" "}
      <h1 className="text-2xl font-semibold">Watchlist</h1>
      {watchlistAssets.length === 0 ? (
        <EmptyComponent
          title={"No Assets in Watchlist Yet"}
          description={
            "You haven't added any assets to your Watchlist yet. Get started by selecting an Asset and adding it to your Watchlist"
          }
        />
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
