import { ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import React, { useState } from "react";
import { PreviousBacktest } from "@/types/backtest-types";
import { useAuth0 } from "@auth0/auth0-react";
import { getBacktestHistory } from "@/api/backtest";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrencyValue, formatPercentageValue } from "@/utils/formatters";
import { EmptyComponent } from "@/app/empty-component";
import { ChartCandlestick } from "lucide-react";

const BacktestHistory = () => {
  const [backtestHistory, setBacktestHistory] = useState<
    PreviousBacktest[] | undefined
  >();
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "return" | "sharpe">("date");
  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const loadBacktestHistory = async () => {
    setLoading(true);
    try {
      const data = await getBacktestHistory();
      setBacktestHistory(data);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 404) {
        setBacktestHistory([]);
      } else if (apiError.status === 401) {
        toast.error("Authentication required");
      } else if (apiError.status >= 500) {
        toast.error("Failed to load backtest history");
      } else {
        toast.error("Failed to load backtest history");
      }
      console.error("Backtest history load failed:", apiError);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadBacktestHistory();
  }, [user_id]);

  const sortedBacktests = React.useMemo(() => {
    if (!backtestHistory) return [];

    return [...backtestHistory].sort((a, b) => {
      switch (sortBy) {
        case "return":
          return b.total_return_pct - a.total_return_pct;
        case "sharpe":
          return b.sharpe_ratio - a.sharpe_ratio;
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });
  }, [backtestHistory, sortBy]);

  const stats = React.useMemo(() => {
    if (!backtestHistory || backtestHistory.length === 0) return null;

    const profitable = backtestHistory.filter(
      (b) => b.total_return_pct > 0,
    ).length;
    const avgReturn =
      backtestHistory.reduce((sum, b) => sum + b.total_return_pct * 100, 0) /
      backtestHistory.length;
    const bestReturn = Math.max(
      ...backtestHistory.map((b) => b.total_return_pct),
    );
    const worstReturn = Math.min(
      ...backtestHistory.map((b) => b.total_return_pct),
    );

    return { profitable, avgReturn, bestReturn, worstReturn };
  }, [backtestHistory]);

  if (loading) {
    return (
      <div className="dashboard">
        <h1 className="text-2xl font-semibold mb-6">Backtest History</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="size-8" />
            <p className="text-muted-foreground">Loading backtest history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!backtestHistory || backtestHistory.length === 0) {
    return (
      <div className="dashboard">
        <h1 className="text-2xl font-semibold mb-6">Backtest History</h1>
        <EmptyComponent
          title={"No backtests yet"}
          description={"Run your first backtest to see results here"}
          icon={ChartCandlestick}
        />
      </div>
    );
  }

  return (
    <div className="dashboard space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Backtest History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Performance analysis across {backtestHistory.length} backtest
            {backtestHistory.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Tabs
          value={sortBy}
          onValueChange={(v) => setSortBy(v as "date" | "return" | "sharpe")}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="date">Recent</TabsTrigger>
            <TabsTrigger value="return">Best Return</TabsTrigger>
            <TabsTrigger value="sharpe">Best Sharpe</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {stats && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Win Rate</CardDescription>
              <CardTitle className="text-2xl">
                {((stats.profitable / backtestHistory.length) * 100).toFixed(0)}
                %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.profitable} of {backtestHistory.length} profitable
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Avg Return</CardDescription>
              <CardTitle className={`text-2xl`}>
                {stats.avgReturn > 0 ? "+" : ""}
                {formatPercentageValue(stats.avgReturn / 100)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Across all strategies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Best Return</CardDescription>
              <CardTitle className="text-2xl ">
                +{formatPercentageValue(stats.bestReturn)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Top performing backtest
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">
                Worst Return
              </CardDescription>
              <CardTitle className="text-2xl">
                {formatPercentageValue(stats.worstReturn)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Worst performing backtest
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {sortedBacktests.map((backtest) => (
          <Card
            key={backtest.id}
            className="hover:shadow-md transition-all cursor-pointer group"
          >
            <CardHeader className={"pb-2"}>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap justify-between">
                    <CardTitle className="text-lg flex flex-row gap-2">
                      <p>
                        {backtest.strategy
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                    </CardTitle>
                    <Badge
                      className={
                        backtest.total_return_pct > 0
                          ? "bg-green-500"
                          : "bg-red-500"
                      }
                    >
                      {backtest.total_return_pct > 0 ? "+" : ""}
                      {(backtest.total_return_pct * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <CardDescription>
                    <div className="text-xs">
                      {format(
                        new Date(backtest.created_at),
                        "MMM dd, yyyy 'at' h:mm a",
                      )}
                    </div>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {backtest.tickers.map((ticker) => (
                <Badge key={ticker} variant="outline" className="text-xs">
                  {ticker}
                </Badge>
              ))}
              <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Absolute Gain
                  </p>
                  <p className="font-bold">
                    {formatCurrencyValue(backtest.total_return_abs)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Final Value
                  </p>
                  <p className="font-bold">
                    {formatCurrencyValue(backtest.final_value)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sharpe</p>
                  <p className="font-bold">
                    {backtest.sharpe_ratio.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Volatility
                  </p>
                  <p className="font-bold">
                    {formatPercentageValue(backtest.volatility)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Period</span>
                  <span className="text-sm font-semibold">
                    {format(new Date(backtest.start_date), "MMM yy")} -{" "}
                    {format(new Date(backtest.end_date), "MMM yy")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Initial Investment
                  </span>
                  <span className="text-sm font-semibold">
                    {formatCurrencyValue(backtest.initial_cash)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Max Drawdown
                  </span>
                  <span className="text-sm font-semibold">
                    {Math.abs(backtest.max_drawdown * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Investments Made
                  </span>
                  <span className="text-sm font-semibold">
                    {backtest.investments_made}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { BacktestHistory };
