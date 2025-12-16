import React from "react";
import { Button } from "@/components/ui/button";
import {
  BacktestParams,
  BacktestStrategy,
  LLMBacktestParams,
  STRATEGY_NAMES,
} from "@/types/backtest-types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Info, TrendingUp } from "lucide-react";
import { formatTimestampShort } from "@/utils/formatters";
import {
  ParameterRow,
  StrategyParameters,
} from "@/app/backtesting/natural-language-param-display";
import { toast } from "sonner";
import { format } from "date-fns";

const NaturalLanguageModal = ({
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
      start_date: format(LLMBacktestResponse.start_date, "yyyy-MM-dd"),
      end_date: format(LLMBacktestResponse.end_date, "yyyy-MM-dd"),
      initial_cash: LLMBacktestResponse.initial_cash,
      parameters: LLMBacktestResponse.parameters,
    };

    onSubmit(params);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Use natural language</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create backtest using natural language</DialogTitle>
          <DialogDescription>
            Describe your investment strategy and our AI will configure the
            backtest parameters
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Strategy</label>
            <Textarea
              value={userNaturalLanguageInput}
              placeholder="E.g., Invest $500 monthly in Apple from 2020 to 2023"
              onChange={(e) => setUserNaturalLanguageInput(e.target.value)}
              className="min-h-24 resize-none"
              rows={4}
            />
          </div>
          {LLMBacktestResponse && (
            <Button
              onClick={() => handleUserInputLLM(userNaturalLanguageInput)}
              disabled={isLLMLoading || !userNaturalLanguageInput.trim()}
            >
              Update Parameters
            </Button>
          )}

          {isLLMLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="text-sm text-muted-foreground">
                    Parsing your strategy...
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {LLMBacktestResponse && !isLLMLoading && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Extracted Parameters
                  </CardTitle>
                  <Badge variant="secondary">
                    <Badge variant="secondary">
                      {
                        STRATEGY_NAMES[
                          LLMBacktestResponse.strategy as BacktestStrategy
                        ]
                      }
                    </Badge>
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
                  value={`${formatTimestampShort(LLMBacktestResponse.start_date)} - ${formatTimestampShort(LLMBacktestResponse.end_date)}`}
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
                  <CardDescription className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{LLMBacktestResponse.comment}</span>
                  </CardDescription>
                )}
                <div className="bg-orange-200 border-l-4 border-orange-500 rounded-lg p-4 font-mono text-sm">
                  {process.env.NODE_ENV === "development" &&
                    LLMBacktestResponse.reasoning && (
                      <div className="space-y-2">
                        <div className="font-semibold text-orange-600">
                          DEV: AI Reasoning
                        </div>
                        <pre className="whitespace-pre-wrap text-xs">
                          {LLMBacktestResponse.reasoning}
                        </pre>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {!LLMBacktestResponse && (
            <Button
              onClick={() => handleUserInputLLM(userNaturalLanguageInput)}
              disabled={isLLMLoading || !userNaturalLanguageInput.trim()}
            >
              Parse Strategy
            </Button>
          )}
          {LLMBacktestResponse && (
            <DialogClose asChild>
              <Button onClick={handleSubmit}>Run Backtest</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { NaturalLanguageModal };
