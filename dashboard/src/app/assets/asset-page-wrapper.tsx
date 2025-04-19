import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AssetPage } from './asset-page'
import {
  getAssetByTicker,
  getTimeseriesDataForAsset,
  Portfolio,
} from '@/api/asset'
import { useState } from 'react'

const AssetPageWrapper = () => {
  const { ticker } = useParams()
  const [pageAsset, setPageAsset] = useState(null)
  const [timeseries, setTimeseries] = useState<Portfolio[]>([])
  const [timeseriesRange, setTimeseriesRange] = useState<string>('1Y')

  const fetchData = async () => {
    const asset = await getAssetByTicker(ticker)

    if (!asset) {
      console.error('Asset not found for ticker:', ticker)
      return
    }

    setPageAsset(asset)
    await getTimeseriesDataForAsset(asset.id, setTimeseries, timeseriesRange)
  }

  useEffect(() => {
    if (ticker) {
      fetchData()
    }
  }, [ticker, timeseriesRange])

  if (!pageAsset) {
    return <div className="text-center mt-10">Loading asset...</div>
  }
  if (pageAsset && timeseries.length === 0) {
    return (
      <div className="text-center mt-10">No data available for this asset.</div>
    )
  }

  return (
    <AssetPage
      pageAsset={pageAsset}
      timeseries={timeseries}
      timeseriesRange={timeseriesRange}
      setTimeseriesRange={setTimeseriesRange}
    />
  )
}

export default AssetPageWrapper
