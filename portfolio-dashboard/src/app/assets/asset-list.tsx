import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
interface Asset {
  asset: string;
  ticker: string;
  volume: string;
  marketCap: string;
  dailyPriceChange: string;
  dailyPercentChange: string;
  latestPrice: string;
}
import { assetsData } from "../../../dev_data/assetsData";
import { Input } from "@/components/ui/input";
import React from "react";

const AssetList = () => {
  const assets: Asset[] = assetsData;
  const [filteredAssets, setFilteredAssets] = React.useState(assets);
  const filterSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = assets.filter((asset) =>
      asset.asset.toLowerCase().includes(searchValue),
    );

    setFilteredAssets(filtered);
  };
  return (
    <div>
      <h1 className="text-2xl font-semibold">Asset List</h1>
      <Input
        onInput={filterSearch}
        placeholder={"Search Assets"}
        className={"mt-4 mb-4"}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Ticker</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Market Cap</TableHead>
            <TableHead>Price Change</TableHead>
            <TableHead>% Change</TableHead>
            <TableHead className="text-right">Latest Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAssets.map((asset) => (
            <TableRow key={asset.asset}>
              <TableCell className="font-medium">{asset.asset}</TableCell>
              <TableCell>{asset.ticker}</TableCell>
              <TableCell>{asset.volume}</TableCell>
              <TableCell>{asset.marketCap}</TableCell>
              <TableCell>{asset.dailyPriceChange}</TableCell>
              <TableCell>{asset.dailyPercentChange}</TableCell>
              <TableCell className="text-right">{asset.latestPrice}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export { AssetList };
