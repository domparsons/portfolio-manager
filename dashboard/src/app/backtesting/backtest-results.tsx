import React from "react";
import { BacktestResult } from "@/types/backtest-types";
import { format } from "date-fns";
import { ResultValues } from "@/app/metrics/result-values";
import { TimeseriesChart } from "@/app/metrics/timeseries-chart";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BacktestInfo } from "@/app/metrics/backtest-info";
import { RiskMetrics } from "@/app/metrics/risk-metrics";

const BacktestResults = ({
  results,
}: {
  results: BacktestResult | undefined;
}) => {
  if (!results) {
    return null;
  }

  const minValue = Math.min(...results.data.history.map((item) => item.value));
  const maxValue = Math.max(...results.data.history.map((item) => item.value));

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Backtest Results</h2>
        <p className="text-sm text-muted-foreground">
          {format(new Date(results.data.start_date), "d MMMM yyyy")} to{" "}
          {format(new Date(results.data.end_date), "d MMMM yyyy")}
        </p>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <ResultValues
          finalValue={results.data.final_value}
          absoluteReturn={results.data.total_return_abs}
          percentageReturn={results.data.total_return_pct}
        />
        <BacktestInfo
          totalInvested={results.data.total_invested}
          investmentsMade={results.data.metrics.investments_made}
          daysAnalysed={results.data.metrics.days_analysed}
        />
        <RiskMetrics
          sharpe={results.data.metrics.sharpe}
          maxDrawdown={results.data.metrics.max_drawdown}
          volatility={results.data.metrics.volatility}
        />
        <Card className={"col-span-full"}>
          <CardHeader>
            <CardTitle>Backtest Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeseriesChart
              chartData={results.data.history}
              minDomain={minValue}
              maxDomain={maxValue}
            />
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
};

export { BacktestResults };
