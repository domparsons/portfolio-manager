import React, { forwardRef, useState } from "react";
import { BacktestResult } from "@/types/backtest-types";
import { format } from "date-fns";
import { ResultValues } from "@/app/metrics/result-values";
import { TimeseriesChart } from "@/app/metrics/timeseries-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BacktestInfo } from "@/app/metrics/backtest-info";
import { RiskMetrics } from "@/app/metrics/risk-metrics";
import { Button } from "@/components/ui/button";
import { AnalyseBacktestResultsWithLLM } from "@/api/llm";
import ReactMarkdown from "react-markdown";
import { Spinner } from "@/components/ui/spinner";

const BacktestResults = forwardRef<
  HTMLDivElement,
  { results: BacktestResult | undefined }
>(({ results }, ref) => {
  if (!results) {
    return null;
  }

  const [isLLMLoadingAnalysis, setIsLLMLoadingAnalysis] = useState(false);
  const [LLMAnalysis, setLLMAnalysis] = useState<string>("");
  const minValue = Math.min(...results.data.history.map((item) => item.value));
  const maxValue = Math.max(...results.data.history.map((item) => item.value));

  const analyseBacktest = async () => {
    setIsLLMLoadingAnalysis(true);
    try {
      const response = await AnalyseBacktestResultsWithLLM(results);
      setLLMAnalysis(response);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLLMLoadingAnalysis(false);
    }
  };

  return (
    <div className="mt-8 space-y-6" ref={ref}>
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
          title={"Final Value"}
        />
        <BacktestInfo
          totalInvested={results.data.total_invested}
          investmentsMade={results.data.metrics.investments_made}
          daysAnalysed={results.data.metrics.days_analysed}
        />
        <RiskMetrics
          sharpe={results.data.metrics.sharpe}
          maxDrawdown={results.data.metrics.max_drawdown}
          maxDrawdownDuration={results.data.metrics.max_drawdown_duration}
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
        <Button
          onClick={analyseBacktest}
          disabled={isLLMLoadingAnalysis}
          className={"col-span-3"}
        >
          {isLLMLoadingAnalysis ? (
            <div className={"flex flex-row space-x-2 items-center"}>
              <Spinner className={"size-5"} />
              <span>Loading...</span>
            </div>
          ) : LLMAnalysis ? (
            "Re-analyse results with AI"
          ) : (
            "Analyse results with AI"
          )}
        </Button>
        {LLMAnalysis && (
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                Your backtest performance compared with S&P 500
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {isLLMLoadingAnalysis ? (
                  <div className={"flex flex-row space-x-2 items-center"}>
                    <Spinner className={"size-5"} />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <ReactMarkdown>{LLMAnalysis}</ReactMarkdown>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
});

BacktestResults.displayName = "BacktestResults";

export { BacktestResults };
