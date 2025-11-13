import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { BacktestParams, BacktestResult } from "@/types/backtest-types";

export const runBacktest = async (params: BacktestParams) => {
  try {
    return await apiClient.post<BacktestResult>("/backtest/", {
      params: { params },
    });
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error running backtest:", apiError);
    toast("There was an error running backtest.");
    throw error;
  }
};
