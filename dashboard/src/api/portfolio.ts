import { apiClient, ApiError } from "@/lib/api-client";
import { TimeseriesChartData, PortfolioMetrics } from "@/types/custom-types";
import { toast } from "sonner";
import React from "react";

export const getPortfolioHistory = async (
  setPortfolioHistory: React.Dispatch<
    React.SetStateAction<TimeseriesChartData[]>
  >,
) => {
  try {
    const data = await apiClient.get<TimeseriesChartData[]>(
      "/portfolio/portfolio_over_time",
      {
        params: { limit: 10 },
      },
    );
    const chartData: TimeseriesChartData[] = data.map((item) => ({
      ...item,
      date: new Date(item.date).toISOString(),
    }));

    setPortfolioHistory(chartData);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      setPortfolioHistory([]);
    } else {
      toast.error("Failed to load portfolio history");
    }
  }
};

export const getPortfolioMetrics = async (
  setTotalReturn: React.Dispatch<React.SetStateAction<number>>,
) => {
  try {
    const data = await apiClient.get<PortfolioMetrics>(
      "/portfolio/portfolio_metrics",
    );
    setTotalReturn(data.total_return_abs);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching portfolio metrics:", apiError);
    toast("There was an error fetching portfolio metrics.");
  }
};

export const getPortfolioHoldings = async () => {
  try {
    return await apiClient.get("/portfolio/holdings");
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching portfolio holdings:", apiError);
    toast("There was an error fetching portfolio holdings.");
    return null;
  }
};
