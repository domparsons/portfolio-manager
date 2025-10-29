import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";

interface MonteCarloResponse {
  final_values: any;
  portfolio_paths: any;
  shares_accumulated: any;
  total_invested: any;
}

export const runMonteCarloSimulations = async () => {
  try {
    const response = await apiClient.get<MonteCarloResponse>("/monte_carlo/");
    console.log(response);

    return [
      response.final_values,
      response.portfolio_paths,
      response.shares_accumulated,
      response.total_invested,
    ];
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error running the Monte Carlo simulation:", apiError);
    toast("There was an error running the Monte Carlo simulation.");
  }
};
