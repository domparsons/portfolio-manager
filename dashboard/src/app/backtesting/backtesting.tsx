import React, { useState } from "react";
import { BacktestParams, BacktestResult, BacktestStrategy, StrategyFormProps } from "@/types/backtest-types";
import { StrategySelector } from "@/app/backtesting/strategy-selector";
import { BacktestResults } from "@/app/backtesting/backtest-results";
import { runBacktest } from "@/api/backtest";
import { BuyAndHoldForm } from "@/app/backtesting/strategies/buy-and-hold";
import { DCAForm } from "@/app/backtesting/strategies/dca";
import { Asset } from "@/types/custom-types";
import { getAssetList } from "@/api/asset";
import { VAForm } from "@/app/backtesting/strategies/va";
import { ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";

const STRATEGY_NAMES: Record<BacktestStrategy, string> = {
  dca: "Dollar Cost Averaging",
  buy_and_hold: "Buy and Hold",
  va: "Value Averaging",
};

const STRATEGY_FORMS: Record<BacktestStrategy, React.FC<StrategyFormProps>> = {
  buy_and_hold: BuyAndHoldForm,
  dca: DCAForm,
  va: VAForm,
};

const Backtesting = () => {
  const [selectedStrategy, setSelectedStrategy] =
    React.useState<BacktestStrategy>("buy_and_hold");
  const [backtestResults, setBacktestResults] = useState<
    BacktestResult | undefined
  >(undefined);
  const handleStrategyChange = (strategy: BacktestStrategy) => {
    setSelectedStrategy(strategy);
    setBacktestResults(undefined);
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleBacktestSubmit = async (params: BacktestParams) => {
    setIsLoading(true);
    try {
      const results = await runBacktest(params);
      setBacktestResults(results);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const StrategyForm = STRATEGY_FORMS[selectedStrategy];

  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);

  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

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

  return (
    <div className="dashboard">
      <h1 className="text-2xl font-semibold">Backtesting</h1>
      <div className={"mt-8"}>
        <h2 className={"mb-2 font-semibold"}>Select a strategy</h2>
        <StrategySelector
          selectedStrategy={selectedStrategy}
          setSelectedStrategy={handleStrategyChange}
          strategyNames={STRATEGY_NAMES}
        />
      </div>
      <StrategyForm
        onSubmit={handleBacktestSubmit}
        isLoading={isLoading}
        assets={assets}
        setFilteredAssets={setFilteredAssets}
        filteredAssets={filteredAssets}
      />
      <BacktestResults results={backtestResults} />
    </div>
  );
};

export { Backtesting };
