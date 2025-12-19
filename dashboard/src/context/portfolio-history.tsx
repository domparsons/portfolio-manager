import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getPortfolioHistory } from "@/api/portfolio";
import type { TimeseriesChartData } from "@/types/custom-types";

export function usePortfolioHistory() {
  const [portfolioHistory, setPortfolioHistory] = useState<
    TimeseriesChartData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const chartDomain = calculateChartDomain(portfolioHistory);
  const dateRange = getDateRange(portfolioHistory);

  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  useEffect(() => {
    if (!user_id) {
      setLoading(false);
      return;
    }

    getPortfolioHistory(setPortfolioHistory)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [user_id]);

  return {
    portfolioHistory,
    loading,
    error,
    ...chartDomain,
    ...dateRange,
  };
}

function calculateChartDomain(data: TimeseriesChartData[]) {
  if (data.length === 0) {
    return { minDomain: 0, maxDomain: 100 };
  }

  const values = data.map((item) => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = 5;

  return {
    minDomain: minValue,
    maxDomain: maxValue + padding,
  };
}

function getDateRange(data: TimeseriesChartData[]) {
  if (data.length === 0) {
    return { startDate: "N/A", endDate: "N/A" };
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

  return {
    startDate: formatDate(data[0].date),
    endDate: formatDate(data[data.length - 1].date),
  };
}
