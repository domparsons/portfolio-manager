import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Sheet } from '@/components/ui/sheet'
import { AssetTable } from '@/app/assets/asset-table'
import { AssetSheetPopover } from '@/app/assets/asset-sheet-popover'
import { TableSkeleton } from '@/app/table-skeleton'
import {
  getAssetList,
  getTimeseriesDataForAsset,
  filterSearch,
  Asset,
  Portfolio,
} from '@/api/asset'
import { Badge } from '@/components/ui/badge'

const AssetList = () => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [sheetAsset, setSheetAsset] = useState<Asset | null>(null)
  const [timeseries, setTimeseries] = useState<Portfolio[]>([])

  useEffect(() => {
    getAssetList(setAssets, setFilteredAssets)
  }, [])

  return (
    <div>
      <Sheet>
        <div className={'flex items-center justify-between'}>
          <h1 className="text-2xl font-semibold">Asset List</h1>
          {assets.length > 0 ? (
            <Badge variant={'outline'}>
              Last updated: {new Date(assets[0].timestamp).toLocaleDateString()}
            </Badge>
          ) : (
            <Badge variant={'outline'}>Loading...</Badge>
          )}
        </div>

        <Input
          onInput={(e) => filterSearch(e, assets, setFilteredAssets)}
          placeholder="Search Assets"
          className="mt-4 mb-4"
        />
        {filteredAssets.length === 0 ? (
          <TableSkeleton />
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
  )
}

export { AssetList }
