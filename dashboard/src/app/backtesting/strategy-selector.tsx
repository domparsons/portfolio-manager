import React from "react";
import { BacktestStrategy } from "@/types/backtest-types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StrategySelector = ({
  selectedStrategy,
  setSelectedStrategy,
  strategyNames,
}: {
  selectedStrategy: BacktestStrategy;
  setSelectedStrategy: (strategy: BacktestStrategy) => void;
  strategyNames: Record<BacktestStrategy, string>;
}) => {
  return (
    <Select
      value={selectedStrategy}
      onValueChange={(value) => setSelectedStrategy(value as BacktestStrategy)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a strategy" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Strategies</SelectLabel>
          {(Object.keys(strategyNames) as BacktestStrategy[]).map(
            (strategy) => (
              <SelectItem key={strategy} value={strategy}>
                {strategyNames[strategy]}
              </SelectItem>
            ),
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { StrategySelector };
