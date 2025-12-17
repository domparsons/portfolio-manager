import { getWatchlist } from "@/api/watchlist";
import React, { useState } from "react";
import { AssetTable } from "@/app/assets/asset-table";
import { AssetSearch } from "@/app/assets/asset-search";
import { Asset } from "@/types/custom-types";
import { EmptyComponent } from "@/app/empty-component";
import { useAuth0 } from "@auth0/auth0-react";
import { ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const Watchlist = () => {
  const [watchlistAssets, setWatchlistAssets] = useState<Asset[]>([]);
  const [filteredWatchlistAssets, setFilteredWatchlistAssets] = useState<
    Asset[]
  >([]);
  const [isWatchlistLoading, setIsWatchlistLoading] =
    React.useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const loadWatchlist = async () => {
    if (!user_id) return;

    setIsWatchlistLoading(true);
    setError(null);

    try {
      const data = await getWatchlist();
      setWatchlistAssets(data);
      setFilteredWatchlistAssets(data);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 404) {
        setWatchlistAssets([]);
        setFilteredWatchlistAssets([]);
      } else if (apiError.status === 401) {
        setError("Please log in to view your watchlist");
        toast.error("Authentication required");
      } else if (apiError.status >= 500) {
        setError("Server error. Please try again in a moment.");
        toast.error("Failed to load watchlist");
      } else {
        setError("Failed to load watchlist");
        toast.error("Failed to load watchlist");
      }

      console.error("Watchlist load failed:", apiError);
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  React.useEffect(() => {
    loadWatchlist();
  }, [user_id]);

  return (
    <div className="watchlist">
      <h1 className="text-2xl font-semibold">Watchlist</h1>

      {isWatchlistLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Spinner className={"size-5"} />
            <p className="text-gray-500">Loading watchlist...</p>
          </div>
        </div>
      )}

      {!isWatchlistLoading && error && (
        <EmptyComponent title="Failed to Load Watchlist" description={error} />
      )}

      {!isWatchlistLoading && !error && watchlistAssets.length === 0 && (
        <EmptyComponent
          title="No Assets in Watchlist Yet"
          description="You haven't added any assets to your Watchlist yet. Get started by selecting an Asset and adding it to your Watchlist"
        />
      )}

      {!isWatchlistLoading && !error && watchlistAssets.length > 0 && (
        <div>
          <AssetSearch
            assets={watchlistAssets}
            setFilteredAssets={setFilteredWatchlistAssets}
            searchListName="watchlist"
          />
          {filteredWatchlistAssets.length === 0 ? (
            <EmptyComponent
              title="No Matching Assets"
              description="No assets match your search criteria"
            />
          ) : (
            <AssetTable filteredAssets={filteredWatchlistAssets} />
          )}
        </div>
      )}
    </div>
  );
};

export { Watchlist };
