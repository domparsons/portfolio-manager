import React from "react";
import { BacktestResult } from "@/types/backtest-types";
import { format } from "date-fns";
import { SharpeRatio } from "@/app/metrics/sharpe-ratio";
import { ResultValues } from "@/app/metrics/result-values";
import { MaxDrawdown } from "@/app/metrics/max-drawdown";
import { Volatility } from "@/app/metrics/volatiity";
import { TimeseriesChart } from "@/app/metrics/timeseries-chart";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <div className={"grid w-full grid-cols-4 gap-4"}>
        <ResultValues
          finalValue={results.data.final_value}
          absoluteReturn={results.data.total_return_abs}
          percentageReturn={results.data.total_return_pct}
        />
        <SharpeRatio sharpeRatio={results.data.metrics.sharpe} />
        <MaxDrawdown maxDrawdown={results.data.metrics.max_drawdown} />
        <Volatility volatility={results.data.metrics.volatility} />
        <Card className={"col-span-4"}>
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
