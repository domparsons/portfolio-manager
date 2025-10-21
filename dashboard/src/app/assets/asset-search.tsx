import React, { useState, useCallback } from "react";
import { Asset } from "@/api/asset";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDownUp } from "lucide-react";

const AssetSearch: React.FC<{
  assets: Asset[];
  setFilteredAssets: (assets: Asset[]) => void;
  searchListName: string;
}> = ({ assets, setFilteredAssets, searchListName }) => {
  const [searchValue, setSearchValue] = useState("");
  const [sortFn, setSortFn] = useState<((a: Asset, b: Asset) => number) | null>(
    null,
  );

  const sortOptions = [
    {
      label: "Name asc",
      sortFn: (a: Asset, b: Asset) => a.asset_name.localeCompare(b.asset_name),
    },
    {
      label: "Name desc",
      sortFn: (a: Asset, b: Asset) => b.asset_name.localeCompare(a.asset_name),
    },
    {
      label: "Market cap",
      sortFn: (a: Asset, b: Asset) =>
        Number(b.market_cap) - Number(a.market_cap),
    },
    {
      label: "Highest % Change",
      sortFn: (a: Asset, b: Asset) =>
        Number(b.percentage_change) - Number(a.percentage_change),
    },
    {
      label: "Lowest % Change",
      sortFn: (a: Asset, b: Asset) =>
        Number(a.percentage_change) - Number(b.percentage_change),
    },
    {
      label: "Highest latest close",
      sortFn: (a: Asset, b: Asset) =>
        Number(b.latest_price) - Number(a.latest_price),
    },
  ];

  const applyFiltersAndSort = useCallback(
    (
      rawAssets: Asset[],
      query: string,
      sorter: ((a: Asset, b: Asset) => number) | null,
    ) => {
      let filtered = rawAssets.filter(
        (asset) =>
          asset.asset_name.toLowerCase().includes(query.toLowerCase()) ||
          asset.ticker.toLowerCase().includes(query.toLowerCase()),
      );
      if (sorter) {
        filtered = [...filtered].sort(sorter);
      }
      setFilteredAssets(filtered);
    },
    [setFilteredAssets],
  );

  const handleSearch = (e: React.FormEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;
    setSearchValue(value);
    applyFiltersAndSort(assets, value, sortFn);
  };

  const handleSort = (newSortFn: (a: Asset, b: Asset) => number) => {
    setSortFn(() => newSortFn); // store function
    applyFiltersAndSort(assets, searchValue, newSortFn);
  };

  return (
    <div className="flex mt-4 mb-4 space-x-4">
      <Input
        value={searchValue}
        onInput={handleSearch}
        placeholder={`Search ${searchListName}`}
      />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button>
            <div>Sort</div>
            <ArrowDownUp />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {sortOptions.map(({ label, sortFn }) => (
            <DropdownMenuItem key={label} onClick={() => handleSort(sortFn)}>
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export { AssetSearch };
