import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AssetTableProps } from "@/types/custom-types";

const AssetTable: React.FC<AssetTableProps> = ({ filteredAssets }) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-sm sm:text-base">
          <TableHead className="p-1 sm:p-2">Asset Name</TableHead>
          <TableHead className="p-1 sm:p-2">Ticker</TableHead>
          <TableHead className="hidden md:table-cell p-1 sm:p-2">Market Cap</TableHead>
          <TableHead className="hidden md:table-cell p-1 sm:p-2">Price Change</TableHead>
          <TableHead className="p-1 sm:p-2">% Change</TableHead>
          <TableHead className="hidden md:table-cell p-1 sm:p-2">Currency</TableHead>
          <TableHead className="p-1 sm:p-2">Latest Close</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAssets.map((asset) => (
          <TableRow
            key={asset.id}
            onClick={() => {
              navigate(`/assets/${asset.ticker.toLowerCase()}`);
            }}
            className="cursor-pointer text-sm sm:text-base"
          >
            <TableCell className="font-medium p-1 sm:p-2">{asset.asset_name}</TableCell>
            <TableCell className="p-1 sm:p-2">{asset.ticker}</TableCell>
            <TableCell className="hidden md:table-cell p-1 sm:p-2">
              {new Intl.NumberFormat("en-US", {
                notation: "compact",
              }).format(asset.market_cap)}
            </TableCell>
            <TableCell className="hidden md:table-cell p-1 sm:p-2">{asset.price_change.toFixed(2)}</TableCell>
            <TableCell className="p-1 sm:p-2">{asset.percentage_change.toFixed(2)}%</TableCell>
            <TableCell className="hidden md:table-cell p-1 sm:p-2">{asset.currency}</TableCell>
            <TableCell className="p-1 sm:p-2">{asset.latest_price.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export { AssetTable };
