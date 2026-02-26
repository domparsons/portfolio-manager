import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { MonteCarloParams, MonteCarloResult } from "@/types/monte-carlo-types";

export const runMonteCarlo = async (
  params: MonteCarloParams,
): Promise<MonteCarloResult> => {
  try {
    return await apiClient.get<MonteCarloResult>("/monte_carlo/", {
      params: {
        ticker_id: params.ticker,
        monthly_investment: params.monthly_investment,
        investment_months: params.investment_months,
        simulation_method: params.simulation_method,
      },
    });
  } catch (error) {
    const apiError = error as ApiError;
    toast.error(`Error running simulation: ${apiError.message}`);
    throw error;
  }
};
