import AssetChart from '@/app/charts/asset-chart'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { AssetSheetPopoverProps, useTransactionType } from '@/api/asset'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { addToWatchlist } from '@/api/watchlist'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TransactionButtons from '@/app/transaction-buttons'

const AssetDetail: React.FC<{
  label: string
  value: string | number
  className?: string
}> = ({ label, value, className }) => (
  <div className="flex flex-col space-y-1 items-center justify-center">
    <p className="font-light text-sm">{label}</p>
    <p className={`font-semibold text-xl ${className || ''}`}>{value}</p>
  </div>
)

const AssetPage: React.FC<AssetSheetPopoverProps> = ({
  pageAsset,
  timeseries,
  timeseriesRange,
  setTimeseriesRange,
}) => {
  const [showTransactionModal, setShowTransactionModal] =
    useState<boolean>(false)
  const [transactionType, setTransactionType] = useTransactionType()
  const user_id = localStorage.getItem('user_id')

  return (
    <>
      <div
        className={'flex flex-row space-x-6 mt-4 items-center justify-between'}
      >
        <div className={'flex flex-row space-x-6 items-center'}>
          <h1 className="text-2xl font-semibold">{pageAsset?.asset_name}</h1>
          <TransactionButtons
            setShowTransactionModal={setShowTransactionModal}
            transactionType={transactionType}
            setTransactionType={setTransactionType}
          />
        </div>
        <Button
          onClick={() => addToWatchlist(user_id, pageAsset?.id)}
          className={'h-6 p-3 pl-2'}
        >
          <Plus />
          Save to Watchlist
        </Button>
      </div>
      {timeseries.length > 0 ? (
        <Card>
          <CardHeader className={'flex flex-row items-center justify-between'}>
            <CardTitle>{pageAsset?.latest_price.toFixed(2)}</CardTitle>
            <Tabs defaultValue={timeseriesRange} className="w-[250px]">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger
                  value="1W"
                  onClick={() => setTimeseriesRange('1W')}
                >
                  1W
                </TabsTrigger>
                <TabsTrigger
                  value="1M"
                  onClick={() => setTimeseriesRange('1M')}
                >
                  1M
                </TabsTrigger>
                <TabsTrigger
                  value="3M"
                  onClick={() => setTimeseriesRange('3M')}
                >
                  3M
                </TabsTrigger>
                <TabsTrigger
                  value="1Y"
                  onClick={() => setTimeseriesRange('1Y')}
                >
                  1Y
                </TabsTrigger>{' '}
                <TabsTrigger
                  value="ALL"
                  onClick={() => setTimeseriesRange('ALL')}
                >
                  ALL
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 max-w-full overflow-hidden">
            <AssetChart data={timeseries} />
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-gray-500">
          No data available for this asset.
        </div>
      )}
      <div
        className={'flex flex-row space-x-6 items-center justify-around p-4'}
      >
        <AssetDetail
          label="Market Cap"
          value={pageAsset?.market_cap.toLocaleString('en-US', {
            notation: 'compact',
          })}
        />
        <AssetDetail
          label="Latest Value"
          value={pageAsset?.latest_price.toFixed(2)}
        />
        <AssetDetail
          label="Daily Price Change"
          value={pageAsset?.price_change.toFixed(2)}
          className={
            (pageAsset?.price_change ?? 0) > 0
              ? 'text-green-600'
              : 'text-red-600'
          }
        />
        <AssetDetail
          label="Daily % Change"
          value={pageAsset?.percentage_change.toFixed(2)}
          className={
            (pageAsset?.percentage_change ?? 0) > 0
              ? 'text-green-600'
              : 'text-red-600'
          }
        />
        <AssetDetail label="Currency" value={pageAsset?.currency} />
      </div>
    </>
  )
}

export { AssetPage }
