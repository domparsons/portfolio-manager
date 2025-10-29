import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import { PortfolioChartData } from "@/api/transaction";

const TrendIndicator = ({
  portfolioHistory,
}: {
  portfolioHistory: PortfolioChartData[];
}) => {
  if (portfolioHistory.length <= 1) {
    return (
      <div className="flex gap-2 font-medium leading-none">
        No data to calculate trend
      </div>
    );
  }

  const current = portfolioHistory[portfolioHistory.length - 1].value;
  const previous = portfolioHistory[portfolioHistory.length - 8].value;
  const trend =
    current === previous ? "equal" : current > previous ? "up" : "down";
  const percentageChange =
    previous === 0 ? 0 : (((current - previous) / previous) * 100).toFixed(2);

  return (
    <div className="flex gap-2 font-medium leading-none">
      {`Trending ${trend} by ${Math.abs(Number(percentageChange))}% this week`}
      {trend === "up" ? (
        <TrendingUp className="h-4 w-4 text-green-500" />
      ) : trend === "down" ? (
        <TrendingDown className="h-4 w-4 text-red-500" />
      ) : (
        <div className="h-4 w-4 text-gray-500">=</div>
      )}
    </div>
  );
};

export { TrendIndicator };
