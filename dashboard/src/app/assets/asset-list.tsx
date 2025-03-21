import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { Info, SquareArrowOutUpRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AssetChart from "@/app/charts/asset-chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface Portfolio {
  id: number;
  close: number;
  timestamp: string;
}

const AssetList = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [sheetAsset, setSheetAsset] = useState<Asset | null>(null);
  const [timeseries, setTimeseries] = useState<Portfolio[]>([]); // Change from Portfolio to Portfolio[]

  const getAssetList = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/asset/asset_list", {
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

  const getTimeseriesDataForAsset = async (assetId: number) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/timeseries/timeseries_for_asset?asset_id=${assetId}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTimeseries(data);
    } catch (error) {
      console.error("Error fetching asset data:", error);
    }
  };

  useEffect(() => {
    getAssetList();
  }, []);

  const filterSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = assets.filter(
      (asset) =>
        asset.asset_name.toLowerCase().includes(searchValue) ||
        asset.ticker.toLowerCase().includes(searchValue),
    );
    setFilteredAssets(filtered);
  };

  // @ts-ignore
  return (
    <div>
      <Sheet>
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
                <TableCell className="font-medium">
                  {asset.asset_name}
                </TableCell>
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
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{sheetAsset?.asset_name}</SheetTitle>
          </SheetHeader>
          {timeseries.length > 0 ? (
            <AssetChart data={timeseries} />
          ) : (
            <div className="text-center text-gray-500">
              No data available for this asset.
            </div>
          )}

          {/* Asset Information Section */}
          <div className="flex flex-col space-y-2 mt-4">
            <p className="font-semibold text-lg">Market Cap</p>
            <p className="text-xl">
              {sheetAsset?.market_cap.toLocaleString("en-US", {
                notation: "compact",
              })}{" "}
            </p>
          </div>
          <div className="flex flex-col space-y-2 mt-4">
            <p className="font-semibold text-lg">Latest Value</p>
            <p className="text-xl">{sheetAsset?.latest_price.toFixed(2)}</p>
          </div>
          <div className="flex flex-col space-y-2 mt-4">
            <p className="font-semibold text-lg">Daily Price Change</p>
            <p className="text-xl text-green-600">
              {sheetAsset?.price_change.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col space-y-2 mt-4">
            <p className="font-semibold text-lg">Daily % Change</p>
            <p
              className={`text-xl ${
                (sheetAsset?.percentage_change ?? 0) > 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {sheetAsset?.percentage_change.toFixed(2)}%
            </p>
          </div>
          <div className="flex flex-col space-y-2 mt-4">
            <p className="font-semibold text-lg">Currency</p>
            <p className="text-xl">{sheetAsset?.currency}</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export { AssetList };
