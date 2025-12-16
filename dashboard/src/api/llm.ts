import { LLMBacktestParams } from "@/types/backtest-types";
import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";

export const parameteriseNaturalLanguageStrategy = async (
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
