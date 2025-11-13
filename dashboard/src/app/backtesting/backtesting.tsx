import React, { useState } from "react";
import {
  BacktestParams,
  BacktestResult,
  BacktestStrategy,
  StrategyFormProps,
} from "@/types/backtest-types";
import { StrategySelector } from "@/app/backtesting/strategy-selector";
import { BacktestResults } from "@/app/backtesting/backtest-results";
import { runBacktest } from "@/api/backtest";
import { BuyAndHoldForm } from "@/app/backtesting/strategies/buy-and-hold";
import { DCAForm } from "@/app/backtesting/strategies/dca";
import { LumpSumForm } from "@/app/backtesting/strategies/lump-sum";

const STRATEGY_NAMES: Record<BacktestStrategy, string> = {
  dca: "Dollar Cost Averaging",
  buy_and_hold: "Buy and Hold",
  lump_sum: "Lump Sum Investing",
};

const STRATEGY_FORMS: Record<BacktestStrategy, React.FC<StrategyFormProps>> = {
  buy_and_hold: BuyAndHoldForm,
  dca: DCAForm,
  lump_sum: LumpSumForm,
};

const Backtesting = () => {
  const [selectedStrategy, setSelectedStrategy] =
    React.useState<BacktestStrategy>("buy_and_hold");
  const [backtestResults, setBacktestResults] = useState<
    BacktestResult | undefined
  >(undefined);
  const handleStrategyChange = (strategy: BacktestStrategy) => {
    setSelectedStrategy(strategy);
    setBacktestResults(undefined);
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleBacktestSubmit = async (params: BacktestParams) => {
    setIsLoading(true);
    try {
      const results = await runBacktest(params);
      setBacktestResults(results);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const StrategyForm = STRATEGY_FORMS[selectedStrategy];

  return (
    <div className="dashboard">
      <h1 className="text-2xl font-semibold">Backtesting</h1>
      <div className={"mt-6"}>
        <h2 className={"mb-2 font-semibold"}>Select a strategy</h2>
        <StrategySelector
          selectedStrategy={selectedStrategy}
          setSelectedStrategy={handleStrategyChange}
          strategyNames={STRATEGY_NAMES}
        />
      </div>
      <StrategyForm onSubmit={handleBacktestSubmit} isLoading={isLoading} />
      <BacktestResults results={backtestResults} />
    </div>
  );
};

export { Backtesting };
