import React from "react";
import { PortfolioHoldings } from "@/types/custom-types";
import { getPortfolioHoldings } from "@/api/portfolio";
import { usePortfolioMetrics } from "@/context/portfolio-context";
import { AssetAllocation } from "@/app/metrics/asset-allocation";
import { RiskMetrics } from "@/app/metrics/risk-metrics";
import { useAuth0 } from "@auth0/auth0-react";

const Portfolio = () => {
  const [chartData, setChartData] = React.useState<PortfolioHoldings[]>([]);

  const { portfolioMetrics } = usePortfolioMetrics();
  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

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
        <RiskMetrics
          sharpe={portfolioMetrics?.sharpe ?? null}
          maxDrawdown={portfolioMetrics?.max_drawdown ?? null}
          volatility={null}
        />
      </div>
    </div>
  );
};

export { Portfolio };
