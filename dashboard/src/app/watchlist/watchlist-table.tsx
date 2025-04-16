import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
interface WatchlistAsset {
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

interface WatchlistAssetTableProps {
  filteredAssets: WatchlistAsset[]
}

const WatchlistTable: React.FC<WatchlistAssetTableProps> = ({
  filteredAssets,
}) => {
  return (
    <Table className={'mt-4'}>
      <TableHeader>
        <TableRow>
          <TableHead>Asset Name</TableHead>
          <TableHead>Ticker</TableHead>
          <TableHead>Market Cap</TableHead>
          <TableHead>Price Change</TableHead>
          <TableHead>% Change</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Latest Close</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAssets.map((asset) => (
          <TableRow key={asset.id}>
            <TableCell className="font-medium">{asset.asset_name}</TableCell>
            <TableCell>{asset.ticker}</TableCell>
            <TableCell>
              {new Intl.NumberFormat('en-US', {
                notation: 'compact',
              }).format(asset.market_cap)}
            </TableCell>{' '}
            <TableCell>{asset.price_change.toFixed(2)}</TableCell>
            <TableCell>{asset.percentage_change.toFixed(2)}%</TableCell>
            <TableCell>{asset.currency}</TableCell>
            <TableCell>
              <div className={'flex flex-row space-x-2'}>
                <div>{asset.latest_price.toFixed(2)}</div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={16}></Info>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Latest update:{' '}
                        {new Date(asset.timestamp).toLocaleDateString()}
                      </p>{' '}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export { WatchlistTable }
