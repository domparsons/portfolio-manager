import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
interface Asset {
  asset_name: string;
  ticker: string;
  market_cap: string;
  // dailyPriceChange: string;
  // dailyPercentChange: string;
  // latestPrice: string;
}
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";

const AssetList = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);

  // Function to fetch asset data
  const getAssetData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/asset", {
        headers: {
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAssets(data);
      setFilteredAssets(data);
    } catch (error) {
      console.error("Error fetching asset data:", error);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    getAssetData();
  }, []);

  // Handle search filtering
  const filterSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = assets.filter((asset) =>
      asset.asset_name.toLowerCase().includes(searchValue),
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
            <TableHead>Market Cap</TableHead>
            {/*<TableHead>Price Change</TableHead>*/}
            {/*<TableHead>% Change</TableHead>*/}
            {/*<TableHead className="text-right">Latest Value</TableHead>*/}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAssets.map((asset) => (
            <TableRow key={asset.asset_name}>
              <TableCell className="font-medium">{asset.asset_name}</TableCell>
              <TableCell>{asset.ticker}</TableCell>
              <TableCell>{asset.market_cap}</TableCell>
              {/*<TableCell>{asset.dailyPriceChange}</TableCell>*/}
              {/*<TableCell>{asset.dailyPercentChange}</TableCell>*/}
              {/*<TableCell className="text-right">{asset.latestPrice}</TableCell>*/}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export { AssetList };
