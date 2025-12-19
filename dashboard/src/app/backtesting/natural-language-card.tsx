import React from "react";
import { Button } from "@/components/ui/button";
import {
  BacktestParams,
  BacktestStrategy,
  LLMBacktestParams,
  STRATEGY_NAMES,
} from "@/types/backtest-types";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";
import {
  ParameterRow,
  StrategyParameters,
} from "@/app/backtesting/natural-language-param-display";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatTimestampLong } from "@/utils/formatters";

const NaturalLanguageCard = ({
  userNaturalLanguageInput,
  setUserNaturalLanguageInput,
  handleUserInputLLM,
  isLLMLoading,
  LLMBacktestResponse,
  onSubmit,
}: {
  userNaturalLanguageInput: string;
  setUserNaturalLanguageInput: (value: string) => void;
  handleUserInputLLM: (userInput: string) => Promise<void>;
  isLLMLoading: boolean;
  LLMBacktestResponse: LLMBacktestParams | undefined;
  onSubmit: (params: BacktestParams) => Promise<void>;
}) => {
  const handleSubmit = () => {
    if (!LLMBacktestResponse?.asset_ids) {
      toast.error("Please select an asset");
      return;
    }
    if (!LLMBacktestResponse?.start_date || !LLMBacktestResponse?.end_date) {
      toast.error("Please select start and end dates");
      return;
    }

    if (LLMBacktestResponse?.initial_cash === undefined) {
      toast.error("Please enter an initial cash value");
      return;
    }

    const params: BacktestParams = {
      strategy: LLMBacktestResponse.strategy,
      asset_ids: LLMBacktestResponse.asset_ids,
      tickers: LLMBacktestResponse.tickers,
      start_date: format(LLMBacktestResponse.start_date, "yyyy-MM-dd"),
      end_date: format(LLMBacktestResponse.end_date, "yyyy-MM-dd"),
      initial_cash: LLMBacktestResponse.initial_cash,
      parameters: LLMBacktestResponse.parameters,
    };

    onSubmit(params);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Describe Your Strategy</CardTitle>
          <CardDescription>
            Tell us your investment plan in plain English
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={userNaturalLanguageInput}
            placeholder="E.g., Invest $500 monthly in Apple from 2020 to 2023"
            onChange={(e) => setUserNaturalLanguageInput(e.target.value)}
            className="resize-none min-h-32"
            rows={6}
          />
          <Button
            onClick={() => handleUserInputLLM(userNaturalLanguageInput)}
            disabled={isLLMLoading || !userNaturalLanguageInput.trim()}
            className="w-full"
          >
            {isLLMLoading
              ? "Parsing..."
              : LLMBacktestResponse
                ? "Update Parameters"
                : "Parse Strategy"}
          </Button>
        </CardContent>
      </Card>

      {isLLMLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm">Parsing your strategy...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {LLMBacktestResponse && !isLLMLoading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Extracted Parameters</CardTitle>
              <Badge variant="secondary">
                {
                  STRATEGY_NAMES[
                    LLMBacktestResponse.strategy as BacktestStrategy
                  ]
                }
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ParameterRow
              icon={TrendingUp}
              label="Tickers"
              value={LLMBacktestResponse.tickers.join(", ")}
            />

            <ParameterRow
              icon={Calendar}
              label="Date Range"
              value={`${formatTimestampLong(LLMBacktestResponse.start_date)} - ${formatTimestampLong(LLMBacktestResponse.end_date)}`}
            />

            <ParameterRow
              icon={DollarSign}
              label="Initial Cash"
              value={`$${LLMBacktestResponse.initial_cash?.toLocaleString() || "10,000"}`}
            />

            {Object.keys(LLMBacktestResponse.parameters).length > 0 && (
              <div className="space-y-2">
                <StrategyParameters
                  strategy={LLMBacktestResponse.strategy}
                  params={LLMBacktestResponse.parameters}
                />
              </div>
            )}

            {LLMBacktestResponse.comment && (
              <div className="bg-purple-50 dark:bg-purple-950 border-l-4 border-purple-500 rounded-lg p-4">
                <div className="font-semibold text-purple-600 dark:text-purple-400 text-sm mb-2">
                  LLM Comment
                </div>
                <p className="text-sm text-purple-900 dark:text-purple-100 whitespace-pre-wrap">
                  {LLMBacktestResponse.comment}
                </p>
              </div>
            )}

            {process.env.NODE_ENV === "development" &&
              LLMBacktestResponse.reasoning && (
                <div className="bg-orange-50 dark:bg-orange-950 border-l-4 border-orange-500 rounded-lg p-4 font-mono">
                  <div className="font-semibold text-orange-600 dark:text-orange-400 text-sm mb-2">
                    DEV: LLM Reasoning
                  </div>
                  <pre className="text-xs text-orange-900 dark:text-orange-100 whitespace-pre-wrap">
                    {LLMBacktestResponse.reasoning}
                  </pre>
                </div>
              )}

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Run Backtest
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { NaturalLanguageCard };
