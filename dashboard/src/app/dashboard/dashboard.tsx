import React from "react";
import { TransactionHistoryCard } from "@/app/dashboard/transaction-history-card";
import { PortfolioCard } from "@/app/portfolio/portfolio-card";
import { usePortfolioMetrics } from "@/context/portfolio-metrics";
import { usePortfolioHistory } from "@/context/portfolio-history";
import { useWatchlistAlerts } from "@/api/watchlist";
import { Spinner } from "@/components/ui/spinner";
import { PortfolioReturns } from "@/app/portfolio/portfolio-returns";
import { RiskMetrics } from "@/app/metrics/risk-metrics";
import { AssetAllocation } from "@/app/metrics/asset-allocation";
import { PortfolioHoldings } from "@/types/custom-types";
import { useAuth0 } from "@auth0/auth0-react";
import { getPortfolioHoldings } from "@/api/portfolio";
import PortfolioSummary from "@/app/portfolio/portfolio-summary";

const Dashboard = () => {
  const { portfolioMetrics, loading, error } = usePortfolioMetrics();

  useWatchlistAlerts();

  const [portfolioHoldings, setPortfolioHoldings] = React.useState<
    PortfolioHoldings[]
  >([]);
  const [holdingsLoading, setHoldingsLoading] = React.useState<boolean>(true);
  const {
    portfolioHistory,
    minDomain,
    maxDomain,
    startDate,
    endDate,
    loading: historyLoading,
  } = usePortfolioHistory();

  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  React.useEffect(() => {
    if (user_id) {
      setHoldingsLoading(true);
      getPortfolioHoldings()
        .then((data) => {
          if (data) {
            setPortfolioHoldings(data);
          }
        })
        .finally(() => {
          setHoldingsLoading(false);
        });
    } else {
      setHoldingsLoading(false);
    }
  }, [user_id]);

  return (
    <>
      <div className="dashboard">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <PortfolioSummary
          currentValue={portfolioMetrics?.current_value}
          totalReturnAbs={portfolioMetrics?.total_return_abs}
          totalReturnPct={portfolioMetrics?.total_return_pct}
          loading={loading}
          error={error}
        />
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Spinner className={"size-5"} />
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
          <RiskMetrics
            sharpe={portfolioMetrics?.sharpe ?? null}
            maxDrawdown={portfolioMetrics?.max_drawdown ?? null}
            maxDrawdownDuration={
              portfolioMetrics?.max_drawdown_duration ?? null
            }
            volatility={portfolioMetrics?.volatility ?? null}
            className="md:col-span-2 lg:col-span-1"
            loading={loading}
          />
          <PortfolioReturns
            holdings={portfolioHoldings}
            className="md:col-span-2 lg:col-span-1 h-[464px] flex flex-col"
            loading={holdingsLoading}
          />
          <TransactionHistoryCard className="md:col-span-2 lg:col-span-1 h-[464px] flex flex-col" />
          <AssetAllocation
            chartData={portfolioHoldings}
            className="md:col-span-2 lg:col-span-1"
            loading={holdingsLoading}
          />
        </div>
      </div>
    </>
  );
};

export { Dashboard };
