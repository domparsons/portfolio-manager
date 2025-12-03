import React from "react";
import { PortfolioHoldings } from "@/types/custom-types";
import { getPortfolioHoldings } from "@/api/portfolio";
import { usePortfolioMetrics } from "@/context/portfolio-metrics";
import { AssetAllocation } from "@/app/metrics/asset-allocation";
import { RiskMetrics } from "@/app/metrics/risk-metrics";
import { useAuth0 } from "@auth0/auth0-react";
import { ResultValues } from "@/app/metrics/result-values";
import { PortfolioCard } from "@/app/dashboard/portfolio-card";
import { usePortfolioHistory } from "@/context/portfolio-history";
import { PortfolioReturns } from "@/app/portfolio/portfolio-returns";

const Portfolio = () => {
  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const [portfolioHoldings, setPortfolioHoldings] = React.useState<
    PortfolioHoldings[]
  >([]);

  const { portfolioHistory, minDomain, maxDomain, startDate, endDate } =
    usePortfolioHistory();

  const { portfolioMetrics, loading, error } = usePortfolioMetrics();

  React.useEffect(() => {
    if (user_id) {
      getPortfolioHoldings(user_id).then((data) => {
        if (data) {
          setPortfolioHoldings(data);
        }
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
        <PortfolioReturns
          holdings={portfolioHoldings}
          className="md:col-span-2 lg:col-span-1"
        />
        <RiskMetrics
          sharpe={portfolioMetrics?.sharpe ?? null}
          maxDrawdown={portfolioMetrics?.max_drawdown ?? null}
          maxDrawdownDuration={portfolioMetrics?.max_drawdown_duration ?? null}
          volatility={portfolioMetrics?.volatility ?? null}
          className="md:col-span-2 lg:col-span-1"
        />
        <PortfolioCard
          portfolioHistory={portfolioHistory}
          startDate={startDate}
          endDate={endDate}
          minDomain={minDomain}
          maxDomain={maxDomain}
          className="md:col-span-2 lg:col-span-3"
        />
        <AssetAllocation
          chartData={portfolioHoldings}
          className="md:col-span-2 lg:col-span-2"
        />
      </div>
    </div>
  );
};

export { Portfolio };
