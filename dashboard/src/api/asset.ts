import { toast } from 'sonner'
import React from 'react'

export interface Asset {
  id: number
  asset_name: string
  ticker: string
  market_cap: number
  price_change: number
  percentage_change: number
  latest_price: number
  currency: string
  description: string
  timestamp: string
}

export interface Portfolio {
  id: number
  close: number
  timestamp: string
}

export interface AssetTableProps {
  filteredAssets: Asset[]
  setHoveredRow: React.Dispatch<React.SetStateAction<number | null>>
  hoveredRow: number | null
  setSheetAsset: React.Dispatch<React.SetStateAction<Asset | null>>
  getTimeseriesDataForAsset: (assetId: number) => void
}

export const getAssetList = async (
  setAssets: (assets: Asset[]) => void,
  setFilteredAssets: (assets: Asset[]) => void
) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/asset/asset_list', {
      headers: {
        Accept: 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch asset list')
    }
    const data = await response.json()
    setAssets(data)
    setFilteredAssets(data)
  } catch (error) {
    console.error('Error fetching asset data:', error)
  }
}

export const getTimeseriesDataForAsset = async (
  assetId: number,
  setTimeseries: (data: Portfolio[]) => void
) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/timeseries/timeseries_for_asset?asset_id=${assetId}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )
    if (!response.ok) {
      toast('There was an error fetching asset data.')
      return
    }
    const data = await response.json()
    setTimeseries(data)
  } catch (error) {
    console.error('Error fetching asset data:', error)
    toast('There was an error fetching asset data.')
  }
}

export const filterSearch = (
  e: React.FormEvent<HTMLInputElement>,
  assets: Asset[],
  setFilteredAssets: (assets: Asset[]) => void
) => {
  const searchValue = (e.target as HTMLInputElement).value.toLowerCase()
  const filtered = assets.filter(
    (asset) =>
      asset.asset_name.toLowerCase().includes(searchValue) ||
      asset.ticker.toLowerCase().includes(searchValue)
  )
  setFilteredAssets(filtered)
}
