import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AssetTableProps } from '@/api/asset'

const WatchlistTable: React.FC<AssetTableProps> = ({ filteredAssets }) => {
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
            <TableCell>{asset.latest_price.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export { WatchlistTable }
