import { SingleAssetSelectorProps } from "@/types/backtest-types";
import React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SingleAssetSelector: React.FC<SingleAssetSelectorProps> = ({
  assets,
  selectedAsset,
  setSelectedAsset,
}) => {
  return (
    <Select
      value={selectedAsset?.asset_name ?? ""}
      onValueChange={(assetName) => {
        const asset = assets.find((a) => a.asset_name === assetName);
        setSelectedAsset(asset);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an asset" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Assets</SelectLabel>
          {assets.map((asset) => (
            <SelectItem key={asset.id} value={asset.asset_name}>
              {asset.asset_name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { SingleAssetSelector };
