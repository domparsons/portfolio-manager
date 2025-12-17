import { BacktestResult, LLMBacktestParams } from "@/types/backtest-types";
import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";

export const ParameteriseNaturalLanguageStrategy = async (
  userInput: string,
) => {
  try {
    return await apiClient.post<LLMBacktestParams>(
      `/llm/parse_strategy?user_input=${userInput}`,
    );
  } catch (error) {
    const apiError = error as ApiError;
    toast.error(`Error parsing strategy with LLM: ${apiError.message}`);
    throw error;
  }
};

export const AnalyseBacktestResultsWithLLM = async (
  backtestResult: BacktestResult,
) => {
  try {
    return await apiClient.post<string>(
      `/llm/analyse_backtest`,
      backtestResult,
    );
  } catch (error) {
    const apiError = error as ApiError;
    toast.error(`Error analysing backtest with LLM: ${apiError.message}`);
    throw error;
  }
};
