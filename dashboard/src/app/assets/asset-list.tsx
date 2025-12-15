import { AssetTable } from "@/app/assets/asset-table";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import { AssetSearch } from "@/app/assets/asset-search";
import { Asset } from "@/types/custom-types";
import { ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { EmptyComponent } from "@/app/empty-component";
import { getAssetList } from "@/api/asset";
import { Loader2 } from "lucide-react";

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
      const data = await getAssetList();
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

      {isAssetListLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <p className="text-gray-500">Loading assets...</p>
          </div>
        </div>
      )}

      {!isAssetListLoading && error && (
        <EmptyComponent title={"Failed to Load Assets"} description={error} />
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
          {filteredAssets.length === 0 ? (
            <EmptyComponent
              title="No Matching Assets"
              description="No assets match your search criteria"
            />
          ) : (
            <AssetTable filteredAssets={filteredAssets} />
          )}
        </div>
      )}
    </div>
  );
};

export { AssetList };
