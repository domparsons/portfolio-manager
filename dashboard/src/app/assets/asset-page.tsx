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

const AssetPage: React.FC<AssetSheetPopoverProps> = ({
  pageAsset,
  timeseries,
}) => {
  const [showTransactionModal, setShowTransactionModal] =
    useState<boolean>(false)

  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy')

  return (
    <>
      <h1>{pageAsset?.asset_name}</h1>
      {timeseries.length > 0 ? (
        <AssetChart data={timeseries} />
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
