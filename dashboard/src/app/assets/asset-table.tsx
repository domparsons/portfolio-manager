import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, SquareArrowOutUpRight } from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";
interface Asset {
  id: number;
  asset_name: string;
  ticker: string;
  market_cap: number;
  price_change: number;
  percentage_change: number;
  latest_price: number;
  currency: string;
  description: string;
  timestamp: string;
}

// Type for timeseries data
interface Portfolio {
  id: number;
  close: number;
  timestamp: string;
}
interface AssetTableProps {
  filteredAssets: Asset[];
  setHoveredRow: React.Dispatch<React.SetStateAction<number | null>>;
  hoveredRow: number | null;
  setSheetAsset: React.Dispatch<React.SetStateAction<Asset | null>>;
  getTimeseriesDataForAsset: (assetId: number) => void;
}

const AssetTable: React.FC<AssetTableProps> = ({
  filteredAssets,
  setHoveredRow,
  hoveredRow,
  setSheetAsset,
  getTimeseriesDataForAsset,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset Name</TableHead>
          <TableHead>Ticker</TableHead>
          <TableHead>Market Cap</TableHead>
          <TableHead>Price Change</TableHead>
          <TableHead>% Change</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Latest Close</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAssets.map((asset) => (
          <TableRow
            key={asset.id}
            onMouseOver={() => setHoveredRow(asset.id)}
            onMouseOut={() => setHoveredRow(null)}
          >
            <TableCell className="font-medium">{asset.asset_name}</TableCell>
            <TableCell>{asset.ticker}</TableCell>
            <TableCell>
              {new Intl.NumberFormat("en-US", {
                notation: "compact",
              }).format(asset.market_cap)}
            </TableCell>{" "}
            <TableCell>{asset.price_change.toFixed(2)}</TableCell>
            <TableCell>{asset.percentage_change.toFixed(2)}%</TableCell>
            <TableCell>{asset.currency}</TableCell>
            <TableCell>
              <div className={"flex flex-row space-x-2"}>
                <div>{asset.latest_price.toFixed(2)}</div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={16}></Info>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Latest update:{" "}
                        {new Date(asset.timestamp).toLocaleDateString()}
                      </p>{" "}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
            <TableCell>
              {hoveredRow === asset.id ? (
                <SheetTrigger asChild>
                  <SquareArrowOutUpRight
                    size={20}
                    className="block cursor-pointer text-sm"
                    onClick={() => {
                      setSheetAsset(asset);
                      getTimeseriesDataForAsset(asset.id);
                    }}
                  >
                    View
                  </SquareArrowOutUpRight>
                </SheetTrigger>
              ) : (
                <div className="invisible text-sm">View</div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export { AssetTable };
