import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { AssetTable } from "@/app/assets/asset-table";
import { AssetSheetPopover } from "@/app/assets/asset-sheet-popover";
import { AssetTableSkeleton } from "@/app/assets/asset-table-skeleton";
import {
  getAssetList,
  getTimeseriesDataForAsset,
  filterSearch,
  Asset,
  Portfolio,
} from "@/api/asset";

const AssetList = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [sheetAsset, setSheetAsset] = useState<Asset | null>(null);
  const [timeseries, setTimeseries] = useState<Portfolio[]>([]);

  useEffect(() => {
    getAssetList(setAssets, setFilteredAssets);
  }, []);

  return (
    <div>
      <Sheet>
        <h1 className="text-2xl font-semibold">Asset List</h1>
        <Input
          onInput={(e) => filterSearch(e, assets, setFilteredAssets)}
          placeholder="Search Assets"
          className="mt-4 mb-4"
        />
        {filteredAssets.length === 0 ? (
          <AssetTableSkeleton />
        ) : (
          <AssetTable
            filteredAssets={filteredAssets}
            setHoveredRow={setHoveredRow}
            hoveredRow={hoveredRow}
            setSheetAsset={setSheetAsset}
            getTimeseriesDataForAsset={(assetId) =>
              getTimeseriesDataForAsset(assetId, setTimeseries)
            }
          />
        )}
        {sheetAsset && (
          <AssetSheetPopover timeseries={timeseries} sheetAsset={sheetAsset} />
        )}
      </Sheet>
    </div>
  );
};

export { AssetList };
