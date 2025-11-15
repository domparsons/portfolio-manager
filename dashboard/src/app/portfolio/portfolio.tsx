import React from "react";
import { PortfolioHoldings } from "@/types/custom-types";
import { getPortfolioHoldings } from "@/api/portfolio";
import { usePortfolioMetrics } from "@/context/portfolio-context";
import { SharpeRatio } from "@/app/metrics/sharpe-ratio";
import { MaxDrawdown } from "@/app/metrics/max-drawdown";
import { AssetAllocation } from "@/app/metrics/asset-allocation";

const Portfolio = () => {
  const [chartData, setChartData] = React.useState<PortfolioHoldings[]>([]);

  const { portfolioMetrics } = usePortfolioMetrics();
  const user_id = localStorage.getItem("user_id");

  React.useEffect(() => {
    if (user_id) {
      getPortfolioHoldings(user_id).then((data) => {
        if (data) setChartData(data);
      });
    }
  }, []);

  return (
    <div className="portfolio">
      <h1 className="text-2xl font-semibold">Portfolio</h1>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4 mt-4">
        <AssetAllocation chartData={chartData} />
        <SharpeRatio sharpeRatio={portfolioMetrics?.sharpe ?? null} />
        <MaxDrawdown maxDrawdown={portfolioMetrics?.max_drawdown ?? null} />
      </div>
    </div>
  );
};

export { Portfolio };
