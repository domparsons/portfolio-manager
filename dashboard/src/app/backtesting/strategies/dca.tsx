import {
  BacktestParams,
  DCA_FREQUENCIES,
  DCAFrequencies,
  StrategyFormProps,
} from "@/types/backtest-types";
import React, { useState } from "react";
import { Asset } from "@/types/custom-types";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SingleAssetSelector } from "@/app/backtesting/single-asset-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/app/date-picker";
import { FrequencySelector } from "@/app/backtesting/frequency-selector";

const DCAForm: React.FC<StrategyFormProps> = ({
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
  const [recurringCash, setRecurringCash] = useState<number | undefined>(
    undefined,
  );

  const [frequency, setFrequency] = useState<DCAFrequencies>(
    DCA_FREQUENCIES.WEEKLY,
  );

  const clearParameters = () => {
    setInitialCash(undefined);
    setEndDate(undefined);
    setStartDate(undefined);
    setSelectedAsset(undefined);
    setRecurringCash(undefined);
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

    if (recurringCash === undefined || recurringCash === 0) {
      toast.error("Please enter a recurring cash value");
      return;
    }

    const params: BacktestParams = {
      strategy: "dollar_cost_averaging",
      asset_ids: selectedAsset ? [selectedAsset.id] : [],
      tickers: selectedAsset ? [selectedAsset.ticker] : [],
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      initial_cash: initialCash,
      parameters: {
        amount_per_period: recurringCash,
        frequency: frequency,
      },
    };

    onSubmit(params);
  };
  return (
    <div className={"mt-8"}>
      <h2 className="text-xl font-semibold mb-2">Dollar Cost Averaging</h2>
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
            <Input
              type="number"
              value={recurringCash ?? ""}
              placeholder={"Recurring investment"}
              onChange={(e) => setRecurringCash(Number(e.target.value))}
              className={"w-56"}
            />
            <FrequencySelector
              frequency={frequency}
              setFrequency={setFrequency}
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

export { DCAForm };
