import React, { useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import { StrategySelector } from "@/app/backtesting/strategy-selector";
import { BacktestResults } from "@/app/backtesting/backtest-results";
import { runBacktest } from "@/api/backtest";
import { getAssetList } from "@/api/asset";
import { ParameteriseNaturalLanguageStrategy } from "@/api/llm";

import {
  BacktestParams,
  BacktestResult,
  BacktestStrategy,
  LLMBacktestParams,
  STRATEGY_FORMS,
  STRATEGY_NAMES
} from "@/types/backtest-types";
import { Asset } from "@/types/custom-types";
import { ApiError } from "@/lib/api-client";
import { NaturalLanguageCard } from "@/app/backtesting/natural-language-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlidersHorizontal, Sparkles } from "lucide-react";

const Backtesting = () => {
  const [selectedStrategy, setSelectedStrategy] =
    useState<BacktestStrategy>("buy_and_hold");
  const [backtestResults, setBacktestResults] = useState<
    BacktestResult | undefined
  >(undefined);
  const [LLMBacktestResponse, setLLMBacktestResponse] = useState<
    LLMBacktestParams | undefined
  >(undefined);
  const [userNaturalLanguageInput, setUserNaturalLanguageInput] = useState("");
  const [isBacktestLoading, setIsBacktestLoading] = useState(false);
  const [isLLMLoading, setIsLLMLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const StrategyForm = STRATEGY_FORMS[selectedStrategy];

  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const handleStrategyChange = (strategy: BacktestStrategy) => {
    setSelectedStrategy(strategy);
    setBacktestResults(undefined);
  };

  const handleUserInputLLM = async (userInput: string) => {
    setIsLLMLoading(true);
    try {
      const results = await ParameteriseNaturalLanguageStrategy(userInput);
      setLLMBacktestResponse(results);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLLMLoading(false);
    }
  };

  const handleBacktestSubmit = async (params: BacktestParams) => {
    setIsBacktestLoading(true);
    try {
      const results = await runBacktest(params);
      setBacktestResults(results);
    } catch (error) {
      console.log(error);
    } finally {
      setIsBacktestLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const data = await getAssetList();
      setAssets(data);
      setFilteredAssets(data);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 404) {
        setAssets([]);
        setFilteredAssets([]);
      } else if (apiError.status === 401) {
        toast.error("Authentication required");
      } else if (apiError.status >= 500) {
        toast.error("Failed to load assets");
      } else {
        toast.error("Failed to load assets");
      }

      console.error("Assets load failed:", apiError);
    }
  };

  React.useEffect(() => {
    loadAssets();
  }, [user_id]);

  React.useEffect(() => {
    if (backtestResults && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [backtestResults]);

  return (
    <div className="dashboard">
      <h1 className="text-2xl font-semibold">Backtesting</h1>
      <Tabs defaultValue="natural" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="natural" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Natural Language
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Manual Configuration
          </TabsTrigger>
        </TabsList>
        <TabsContent value="natural" className="space-y-6">
          <NaturalLanguageCard
            userNaturalLanguageInput={userNaturalLanguageInput}
            setUserNaturalLanguageInput={setUserNaturalLanguageInput}
            handleUserInputLLM={handleUserInputLLM}
            isLLMLoading={isLLMLoading}
            LLMBacktestResponse={LLMBacktestResponse}
            onSubmit={handleBacktestSubmit}
          />
        </TabsContent>
        <TabsContent value="manual" className="space-y-6">
          <h2 className={"mb-2 font-semibold mt-4"}>Select a strategy</h2>
          <StrategySelector
            selectedStrategy={selectedStrategy}
            setSelectedStrategy={handleStrategyChange}
            strategyNames={STRATEGY_NAMES}
          />
          <StrategyForm
            onSubmit={handleBacktestSubmit}
            isLoading={isBacktestLoading}
            assets={assets}
            setFilteredAssets={setFilteredAssets}
            filteredAssets={filteredAssets}
          />
        </TabsContent>
      </Tabs>
      <BacktestResults results={backtestResults} ref={resultsRef} />
    </div>
  );
};

export { Backtesting };
