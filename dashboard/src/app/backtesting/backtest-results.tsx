import React from "react";
import { BacktestResult } from "@/types/backtest-types";

const BacktestResults = ({
  results,
}: {
  results: BacktestResult | undefined;
}) => {
  return <div>{JSON.stringify(results)}</div>;
};

export { BacktestResults };
