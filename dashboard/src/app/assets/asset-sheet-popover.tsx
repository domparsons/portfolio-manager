import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AssetChart from "@/app/charts/asset-chart";

interface Portfolio {
  id: number;
  close: number;
  timestamp: string;
}

interface Asset {
  asset_name: string;
  market_cap: number;
  latest_price: number;
  price_change: number;
  percentage_change: number;
  currency: string;
}

interface AssetSheetPopoverProps {
  timeseries: Portfolio[];
  sheetAsset: Asset;
}

const AssetSheetPopover: React.FC<AssetSheetPopoverProps> = ({
  timeseries,
  sheetAsset,
}) => {
  return (
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

      <div className="flex flex-col space-y-2 mt-4">
        <p className="font-semibold text-lg">Market Cap</p>
        <p className="text-xl">
          {sheetAsset?.market_cap.toLocaleString("en-US", {
            notation: "compact",
          })}
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
  );
};

export { AssetSheetPopover };
