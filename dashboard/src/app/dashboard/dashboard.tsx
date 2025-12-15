import React from "react";
import { TransactionHistoryCard } from "@/app/dashboard/transaction-history-card";
import { PortfolioCard } from "@/app/dashboard/portfolio-card";
import { usePortfolioMetrics } from "@/context/portfolio-metrics";
import { formatCurrencyValue, formatPercentageValue } from "@/utils/formatters";
import { usePortfolioHistory } from "@/context/portfolio-history";
import { useWatchlistAlerts } from "@/api/watchlist";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { portfolioMetrics, loading, error } = usePortfolioMetrics();

  const { portfolioHistory, minDomain, maxDomain, startDate, endDate, loading: historyLoading } =
    usePortfolioHistory();

  useWatchlistAlerts();

  return (
    <div className="dashboard">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="flex flex-col justify-between mt-4 mb-2">
        <div className="flex flex-row space-x-2 items-center">
          <h2 className={"text-xl font-semibold"}>
            ${portfolioMetrics?.current_value}
          </h2>
          <p
            className={`font-semibold ${
              portfolioMetrics &&
              portfolioMetrics.total_return_abs !== undefined &&
              portfolioMetrics.total_return_abs >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {loading
              ? ""
              : error
                ? ""
                : portfolioMetrics?.total_return_abs !== undefined
                  ? portfolioMetrics.total_return_abs >= 0
                    ? `+${formatCurrencyValue(portfolioMetrics.total_return_abs)} (${formatPercentageValue(portfolioMetrics.total_return_pct)})`
                    : `-${formatCurrencyValue(Math.abs(portfolioMetrics.total_return_abs))} (${formatPercentageValue(portfolioMetrics.total_return_pct)})`
                  : ""}
          </p>
        </div>
        <p>Portfolio Value</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <p className="text-gray-500">Loading portfolio...</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 mt-4">
        <PortfolioCard
          portfolioHistory={portfolioHistory}
          startDate={startDate}
          endDate={endDate}
          minDomain={minDomain}
          maxDomain={maxDomain}
          className={"col-span-2"}
          loading={historyLoading}
        />
        <TransactionHistoryCard />
      </div>
    </div>
  );
};

export { Dashboard };
