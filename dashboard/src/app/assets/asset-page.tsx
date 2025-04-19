import AssetChart from '@/app/charts/asset-chart'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { AssetSheetPopoverProps } from '@/api/asset'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { addToWatchlist } from '@/api/watchlist'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const AssetPage: React.FC<AssetSheetPopoverProps> = ({
  pageAsset,
  timeseries,
  timeseriesRange,
  setTimeseriesRange,
}) => {
  const [showTransactionModal, setShowTransactionModal] =
    useState<boolean>(false)

  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy')

  const user_id = localStorage.getItem('user_id')

  return (
    <>
      <div
        className={'flex flex-row space-x-6 mt-4 items-center justify-between'}
      >
        <h1 className="text-2xl font-semibold">{pageAsset?.asset_name}</h1>
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
            <CardTitle>Data</CardTitle>
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

      <div className="flex flex-col space-y-2 mt-4">
        <p className="font-semibold text-lg">Market Cap</p>
        <p className="text-xl">
          {pageAsset?.market_cap.toLocaleString('en-US', {
            notation: 'compact',
          })}
        </p>
      </div>
      <div className="flex flex-col space-y-2 mt-4">
        <p className="font-semibold text-lg">Latest Value</p>
        {/*<p className="text-xl">{pageAsset?.latest_price.toFixed(2)}</p>*/}
      </div>
      <div className="flex flex-col space-y-2 mt-4">
        <p className="font-semibold text-lg">Daily Price Change</p>
        <p className="text-xl text-green-600">
          {/*{pageAsset?.price_change.toFixed(2)}*/}
        </p>
      </div>
      <div className="flex flex-col space-y-2 mt-4">
        <p className="font-semibold text-lg">Daily % Change</p>
        <p
          className={`text-xl ${
            (pageAsset?.percentage_change ?? 0) > 0
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {/*{pageAsset?.latest_price.toFixed(2)}*/}
        </p>
      </div>
      <div className="flex flex-col space-y-2 mt-4">
        <p className="font-semibold text-lg">Currency</p>
        <p className="text-xl">{pageAsset?.currency}</p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className={'bg-green-600'}
            onClick={() => {
              setShowTransactionModal(true)
              setTransactionType('buy')
            }}
          >
            {' '}
            Buy
          </Button>
        </DialogTrigger>
        <DialogTrigger asChild>
          <Button
            className={'bg-red-600'}
            onClick={() => {
              setShowTransactionModal(true)
              setTransactionType('sell')
            }}
          >
            Sell
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{transactionType}</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <Input placeholder="Enter amount" />
        </DialogContent>
      </Dialog>
    </>
  )
}

export { AssetPage }
