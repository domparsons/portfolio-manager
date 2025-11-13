import React from "react";
import { BacktestResult } from "@/types/backtest-types";

const BacktestResults = ({
  results,
}: {
  results: BacktestResult | undefined;
}) => {
  if (!results) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Backtest Results</h2>
        <p className="text-sm text-muted-foreground">
          {results.data.start_date} to {results.data.end_date}
        </p>
      </div>
      <div className={"flex flex-col space-y-0"}>
        <p>Initial value: ${results.data.initial_value.toFixed(2)}</p>
        <p>Final value: ${results.data.final_value.toFixed(2)}</p>
        <p>Total absolute return: {results.data.total_return_abs.toFixed(2)}</p>
        <p>Total return percent: {results.data.total_return_pct.toFixed(2)}%</p>
        <p>Sharpe ratio: {results.data.metrics.sharpe.toFixed(2)}</p>
        <p>Max drawdown: {results.data.metrics.max_drawdown.toFixed(2)}</p>
        <p>Volatility: {results.data.metrics.volatility.toFixed(2)}</p>
        <p>Days analysed: {results.data.metrics.days_analysed}</p>
      </div>
    </div>
  );
};

export { BacktestResults };
