import { BacktestParams, StrategyFormProps } from "@/types/backtest-types";
import React, { useState } from "react";
import { Asset } from "@/types/custom-types";
import { SingleAssetSelector } from "@/app/backtesting/single-asset-selector";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/app/date-picker";

const BuyAndHoldForm: React.FC<StrategyFormProps> = ({
  onSubmit,
  isLoading,
  assets,
  backtestPortfolio,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>(
    undefined,
  );
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [initialCash, setInitialCash] = useState<number | undefined>(undefined);

  const clearParameters = () => {
    setInitialCash(undefined);
    setEndDate(undefined);
    setStartDate(undefined);
    setSelectedAsset(undefined);
  };

  const handleSubmit = () => {
    if (!selectedAsset && !backtestPortfolio) {
      toast.error("Please select an asset");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (initialCash === undefined) {
      toast.error("Please enter an initial cash value");
      return;
    }

    const params: BacktestParams = {
      strategy: "buy_and_hold",
      asset_ids: selectedAsset ? [selectedAsset.id] : [],
      tickers: selectedAsset ? [selectedAsset.ticker] : [],
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      initial_cash: initialCash,
      parameters: {},
    };

    onSubmit(params);
  };

  return (
    <div className={"mt-8"}>
      <h2 className="text-xl font-semibold mb-2">Buy and Hold</h2>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className={"col-span-3"}>
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
          </CardHeader>
          <CardContent
            className={"flex flex-row flex-wrap [&>*]:mb-4 [&>*]:mr-4"}
          >
            {!backtestPortfolio && (
              <SingleAssetSelector
                assets={assets}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
              />
            )}
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              label={"Select a start date"}
            />
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              label={"Select an end date"}
            />
            <Input
              type="number"
              value={initialCash ?? ""}
              placeholder={"Initial investment"}
              onChange={(e) => setInitialCash(Number(e.target.value))}
              className={"w-56"}
            />
            <Button
              onClick={clearParameters}
              disabled={isLoading}
              variant={"outline"}
            >
              Clear parameters
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Running..." : "Run Backtest"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { BuyAndHoldForm };
