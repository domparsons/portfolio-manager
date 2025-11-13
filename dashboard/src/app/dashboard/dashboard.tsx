import { ChartConfig } from "@/components/ui/chart";
import React, { useState } from "react";
import { TransactionHistoryCard } from "@/app/dashboard/transaction-history-card";
import { PortfolioCard } from "@/app/dashboard/portfolio-card";
import { PortfolioChartData } from "@/types/custom-types";
import { getPortfolioHistory } from "@/api/portfolio";
import { usePortfolioMetrics } from "@/context/portfolio-context";
import { EmptyComponent } from "@/app/empty-component";

const Dashboard = () => {
  const [portfolioHistory, setPortfolioHistory] = React.useState<
    PortfolioChartData[]
  >([]);

  const { portfolioMetrics, loading, error } = usePortfolioMetrics();

  const user_id = localStorage.getItem("user_id");

  const minValue = Math.min(...portfolioHistory.map((item) => item.value));
  const maxValue = Math.max(...portfolioHistory.map((item) => item.value));
  const padding = 5;

  const portfolioValue =
    portfolioHistory.length > 0
      ? portfolioHistory[portfolioHistory.length - 1].value.toFixed(2)
      : "0.00";

  const minDomain = minValue - padding;
  const maxDomain = maxValue + padding;

  const chartConfig = {
    value: {
      label: "Value",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const startDate =
    portfolioHistory.length > 0
      ? new Date(portfolioHistory[0].date).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })
      : "N/A";

  const endDate =
    portfolioHistory.length > 0
      ? new Date(
          portfolioHistory[portfolioHistory.length - 1].date,
        ).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })
      : "N/A";

  React.useEffect(() => {
    getPortfolioHistory(setPortfolioHistory, user_id);
  }, []);

  return (
    <div className="dashboard">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="flex flex-col justify-between mt-4 mb-2">
        <div className="flex flex-row space-x-2 items-center">
          <h2 className={"text-xl font-semibold"}>${portfolioValue}</h2>
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
                    ? `+$${portfolioMetrics.total_return_abs.toFixed(2)}`
                    : `-$${Math.abs(portfolioMetrics.total_return_abs).toFixed(2)}`
                  : ""}
          </p>
        </div>
        <p>Portfolio Value</p>
      </div>
      {portfolioHistory.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <PortfolioCard
            portfolioHistory={portfolioHistory}
            startDate={startDate}
            endDate={endDate}
            chartConfig={chartConfig}
            minDomain={minDomain}
            maxDomain={maxDomain}
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
