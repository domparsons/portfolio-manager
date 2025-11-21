import React from "react";
import { PortfolioHoldings, TimeseriesChartData } from "@/types/custom-types";
import { getPortfolioHistory, getPortfolioHoldings } from "@/api/portfolio";
import { usePortfolioMetrics } from "@/context/portfolio-metrics";
import { AssetAllocation } from "@/app/metrics/asset-allocation";
import { RiskMetrics } from "@/app/metrics/risk-metrics";
import { useAuth0 } from "@auth0/auth0-react";
import { Card } from "@/components/ui/card";
import { ResultValues } from "@/app/metrics/result-values";
import { PortfolioCard } from "@/app/dashboard/portfolio-card";
import { usePortfolioHistory } from "@/context/portfolio-history";

const Portfolio = () => {
  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const [chartData, setChartData] = React.useState<PortfolioHoldings[]>([]);

  const { portfolioHistory, minDomain, maxDomain, startDate, endDate } =
    usePortfolioHistory();

  const { portfolioMetrics, loading, error } = usePortfolioMetrics();

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <ResultValues
          finalValue={portfolioMetrics?.current_value ?? null}
          absoluteReturn={portfolioMetrics?.total_return_abs ?? null}
          percentageReturn={portfolioMetrics?.total_return_pct ?? null}
          title={"Current Value"}
          className="md:col-span-2 lg:col-span-1"
        />
        <AssetAllocation
          chartData={chartData}
          className="md:col-span-2 lg:col-span-2"
        />
        <PortfolioCard
          portfolioHistory={portfolioHistory}
          startDate={startDate}
          endDate={endDate}
          minDomain={minDomain}
          maxDomain={maxDomain}
          className="md:col-span-2 lg:col-span-2"
        />
        <RiskMetrics
          sharpe={portfolioMetrics?.sharpe ?? null}
          maxDrawdown={portfolioMetrics?.max_drawdown ?? null}
          volatility={portfolioMetrics?.volatility ?? null}
          className="md:col-span-2 lg:col-span-1"
        />
      </div>
    </div>
  );
};

export { Portfolio };
