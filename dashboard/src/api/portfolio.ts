import { apiClient, ApiError } from "@/lib/api-client";
import { TimeseriesChartData } from "@/types/custom-types";
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

export const runRebalanceSuggestion = async (
  userGoals: string,
  suggestions: Record<string, number>,
) => {
  try {
    return await apiClient.post<string>("/llm/allocation_suggester", suggestions, {
      params: { user_input: userGoals },
    });
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error running allocation suggester", apiError);
    toast("There was an error running the allocation suggester.");
    return null;
  }
};
