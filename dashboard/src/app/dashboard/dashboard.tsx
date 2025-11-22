import React from "react";
import { TransactionHistoryCard } from "@/app/dashboard/transaction-history-card";
import { PortfolioCard } from "@/app/dashboard/portfolio-card";
import { usePortfolioMetrics } from "@/context/portfolio-metrics";
import { EmptyComponent } from "@/app/empty-component";
import { formatCurrencyValue, formatPercentageValue } from "@/utils/formatters";
import { usePortfolioHistory } from "@/context/portfolio-history";
import { useWatchlistAlerts } from "@/api/watchlist";

const Dashboard = () => {
  const { portfolioMetrics, loading, error } = usePortfolioMetrics();

  const { portfolioHistory, minDomain, maxDomain, startDate, endDate } =
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
      {portfolioHistory.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 mt-4">
          <PortfolioCard
            portfolioHistory={portfolioHistory}
            startDate={startDate}
            endDate={endDate}
            minDomain={minDomain}
            maxDomain={maxDomain}
            className={"col-span-2"}
          />
          <TransactionHistoryCard />
        </div>
      ) : (
        <EmptyComponent
          title={"No Transactions Yet"}
          description={
            "You haven't created any transactions yet. Get started by creating your first transaction in the Assets List."
          }
        />
      )}
    </div>
  );
};

export { Dashboard };
