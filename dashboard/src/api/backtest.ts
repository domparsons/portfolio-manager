import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import {
  BacktestParams,
  BacktestResult,
  PreviousBacktest,
} from "@/types/backtest-types";

export const runBacktest = async (params: BacktestParams) => {
  try {
    console.log("params" + params);
    return await apiClient.post<BacktestResult>("/backtest/", params);
  } catch (error) {
    const apiError = error as ApiError;
    toast.error(`Error running backtest: ${apiError.message}`);
    throw error;
  }
};

export const getBacktestHistory = async () => {
  try {
    return await apiClient.get<PreviousBacktest[]>(
      "/backtest/backtest_history",
    );
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching backtest history:", apiError);
    toast("There was an error fetching backtest history.");
  }
};
