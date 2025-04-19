import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { AssetTable } from '@/app/assets/asset-table'
import { TableSkeleton } from '@/app/table-skeleton'
import { getAssetList, filterSearch, Asset } from '@/api/asset'
import { Badge } from '@/components/ui/badge'

const AssetList = () => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])

  useEffect(() => {
    getAssetList(setAssets, setFilteredAssets)
  }, [])

  return (
    <div>
      <div className={'flex items-center justify-between'}>
        <h1 className="text-2xl font-semibold">Assets</h1>
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
        <AssetTable filteredAssets={filteredAssets} />
      )}
    </div>
  )
}

export { AssetList }
