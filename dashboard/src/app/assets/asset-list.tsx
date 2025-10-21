import { Asset, getAssetList } from "@/api/asset";
import { AssetTable } from "@/app/assets/asset-table";
import { TableSkeleton } from "@/app/table-skeleton";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from "react";
import { AssetSearch } from "@/app/assets/asset-search";

const AssetList = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);

  useEffect(() => {
    getAssetList(setAssets, setFilteredAssets);
  }, []);

  return (
    <div>
      <div className={"flex items-center justify-between"}>
        <h1 className="text-2xl font-semibold">Assets</h1>
        {assets.length > 0 ? (
          <Badge variant={"outline"}>
            Last updated: {new Date(assets[0].timestamp).toLocaleDateString()}
          </Badge>
        ) : (
          <Badge variant={"outline"}>Loading...</Badge>
        )}
      </div>

      <AssetSearch
        assets={assets}
        setFilteredAssets={setFilteredAssets}
        searchListName={"assets"}
      />
      {filteredAssets.length === 0 ? (
        <TableSkeleton />
      ) : (
        <AssetTable filteredAssets={filteredAssets} />
      )}
    </div>
  );
};

export { AssetList };
