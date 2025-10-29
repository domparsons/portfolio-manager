import { ChartConfig } from "@/components/ui/chart";
import React from "react";
import { TransactionHistoryCard } from "@/app/dashboard/transaction-history-card";
import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { PortfolioChartData, PortfolioValueHistory } from "@/api/transaction";
import { PortfolioCard } from "@/app/dashboard/portfolio-card";

const Dashboard = () => {
  const [portfolioHistory, setPortfolioHistory] = React.useState<
    PortfolioChartData[]
  >([]);

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

  const getPortfolioHistory = async () => {
    if (!user_id) return;

    try {
      const data = await apiClient.get<PortfolioValueHistory[]>(
        `/portfolio/portfolio_over_time/${user_id}`,
        {
          params: { limit: 10 },
        },
      );
      const chartData: PortfolioChartData[] = data.map((item) => ({
        ...item,
        date: new Date(item.date).getTime(),
      }));

      setPortfolioHistory(chartData);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Error fetching portfolio history:", apiError);
      toast("There was an error fetching portfolio history.");
    }
  };

  React.useEffect(() => {
    getPortfolioHistory();
  }, []);

  return (
    <div className="dashboard">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="flex flex-col justify-between mt-4 mb-2">
        <h2 className={"text-xl font-semibold"}>${portfolioValue}</h2>
        <p>Portfolio Value</p>
      </div>
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
    </div>
  );
};

export { Dashboard };
