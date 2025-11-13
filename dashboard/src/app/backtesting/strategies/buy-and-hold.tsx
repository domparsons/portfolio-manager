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
  const [initialCash, setInitialCash] = useState<number>(100);
  const handleSubmit = () => {
    if (!selectedAsset) {
      toast.error("Please select an asset");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
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

      <SingleAssetSelector
        assets={assets}
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
      />
      <div className={"mt-4"}>
        <p>Start date</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!startDate}
              className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon />
              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className={"mt-4"}>
        <p>End date</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!endDate}
              className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon />
              {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
          </PopoverContent>
        </Popover>
      </div>
      <div className={"mt-4 w-56"}>
        <p>Initial cash</p>
        <Input
          type="number"
          value={initialCash}
          onChange={(e) => setInitialCash(Number(e.target.value))}
        />
      </div>
      <div className={"mt-4"}>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Running..." : "Run Backtest"}
        </Button>
      </div>
    </div>
  );
};

export { BuyAndHoldForm };
