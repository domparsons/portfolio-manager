import { BacktestParams, StrategyFormProps } from "@/types/backtest-types";
import React, { useState } from "react";
import { Asset } from "@/types/custom-types";
import { SingleAssetSelector } from "@/app/backtesting/single-asset-selector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BuyAndHoldForm: React.FC<StrategyFormProps> = ({
  onSubmit,
  isLoading,
  assets,
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
    if (!selectedAsset) {
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
      asset_ids: [selectedAsset.id],
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
            className={"flex flex-row flex-wrap space-x-4 [&>*]:mb-2"}
          >
            <SingleAssetSelector
              assets={assets}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
            />
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!startDate}
                    className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                  >
                    <CalendarIcon />
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!endDate}
                    className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                  >
                    <CalendarIcon />
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={endDate}
                    onSelect={setEndDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className={"w-56"}>
              <Input
                type="number"
                value={initialCash ?? ""}
                placeholder={"Initial cash"}
                onChange={(e) => setInitialCash(Number(e.target.value))}
              />
            </div>
            <div>
              <Button
                onClick={clearParameters}
                disabled={isLoading}
                variant={"outline"}
              >
                Clear parameters
              </Button>
            </div>
            <div>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Running..." : "Run Backtest"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { BuyAndHoldForm };
