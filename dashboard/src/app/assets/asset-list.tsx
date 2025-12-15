import { AssetTable } from "@/app/assets/asset-table";
import { TableSkeleton } from "@/app/table-skeleton";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import { AssetSearch } from "@/app/assets/asset-search";
import { Asset } from "@/types/custom-types";
import { getWatchlist } from "@/api/watchlist";
import { ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { EmptyComponent } from "@/app/empty-component";

const AssetList = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [isAssetListLoading, setIsAssetListLoading] =
    React.useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const loadWatchlist = async () => {
    if (!user_id) return;

    setIsAssetListLoading(true);
    setError(null);

    try {
      const data = await getWatchlist(user_id);
      setAssets(data);
      setFilteredAssets(data);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 404) {
        setAssets([]);
        setFilteredAssets([]);
      } else if (apiError.status === 401) {
        setError("Please log in to view assets");
        toast.error("Authentication required");
      } else if (apiError.status >= 500) {
        setError("Server error. Please try again in a moment.");
        toast.error("Failed to load watchlist");
      } else {
        setError("Failed to load assets");
        toast.error("Failed to load assets");
      }

      console.error("Assets load failed:", apiError);
    } finally {
      setIsAssetListLoading(false);
    }
  };

  React.useEffect(() => {
    loadWatchlist();
  }, [user_id]);

  return (
    <div>
      <div className={"flex items-center justify-between"}>
        <h1 className="text-2xl font-semibold">Assets</h1>
        {assets.length > 0 && (
          <Badge variant={"outline"}>
            Last updated: {new Date(assets[0].timestamp).toLocaleDateString()}
          </Badge>
        )}
      </div>

      {isAssetListLoading && <TableSkeleton />}

      {!isAssetListLoading && error && (
        <EmptyComponent title={"Failed to Load Asserts"} description={error} />
      )}

      {!isAssetListLoading && !error && assets.length === 0 && (
        <EmptyComponent
          title="No Assets Available"
          description="Could not find any assets."
        />
      )}

      {!isAssetListLoading && !error && assets.length > 0 && (
        <div>
          <AssetSearch
            assets={assets}
            setFilteredAssets={setFilteredAssets}
            searchListName={"assets"}
          />
          <AssetTable filteredAssets={filteredAssets} />
        </div>
      )}
    </div>
  );
};

export { AssetList };
