import { apiClient, ApiError } from "@/lib/api-client";
import {
  PortfolioChartData,
  PortfolioMetrics,
  PortfolioValueHistory,
} from "@/types/custom-types";
import { toast } from "sonner";

export const getPortfolioHistory = async (
  setPortfolioHistory: React.Dispatch<
    React.SetStateAction<PortfolioChartData[]>
  >,
  user_id: string | null,
) => {
  if (!user_id) return;

  try {
    const data = await apiClient.get<PortfolioValueHistory[]>(
      `/portfolio/portfolio_over_time/${user_id}`,
      {
        params: { limit: 10 },
      },
    );
    const chartData: PortfolioChartData[] = data.map((item) => ({
      ...item,
      date: new Date(item.date).getTime(),
    }));

    setPortfolioHistory(chartData);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching portfolio history:", apiError);
    toast("There was an error fetching portfolio history.");
  }
};

export const getPortfolioMetrics = async (
  setTotalReturn: React.Dispatch<React.SetStateAction<number>>,
  user_id: string | null,
) => {
  if (!user_id) return;

  try {
    const data = await apiClient.get<PortfolioMetrics>(
      `/portfolio/portfolio_metrics/${user_id}`,
    );
    setTotalReturn(data.total_return_abs);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching portfolio history:", apiError);
    toast("There was an error fetching portfolio history.");
  }
};
