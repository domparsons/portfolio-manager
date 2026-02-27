import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Asset } from "@/types/custom-types";
import { SingleAssetSelector } from "@/app/backtesting/single-asset-selector";
import { getAssetList } from "@/api/asset";
import { runMonteCarlo } from "@/api/monte-carlo";
import { ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { MonteCarloStrategySelector } from "@/app/montecarlo/monte-carlo-strategy-selector";
import { MonteCarloResults } from "@/app/montecarlo/monte-carlo-results";
import {
  MonteCarloParams,
  MonteCarloResult,
  MonteCarloStrategies,
} from "@/types/monte-carlo-types";

const MonteCarloSimulation = () => {
  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const [monthlyInvestment, setMonthlyInvestment] =
    React.useState<number>(1000);
  const [investmentMonths, setInvestmentMonths] = React.useState<number>(60);
  const [isLoading, setIsLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset>();
  const [simulationMethod, setSimulationMethod] =
    useState<MonteCarloStrategies>("Bootstrap");
  const [results, setResults] = useState<MonteCarloResult | undefined>();

  const loadAssets = async () => {
    try {
      const data = await getAssetList();
      setAssets(data);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 404) {
        setAssets([]);
      } else if (apiError.status === 401) {
        toast.error("Authentication required");
      } else {
        toast.error("Failed to load assets");
      }

      console.error("Assets load failed:", apiError);
    }
  };

  React.useEffect(() => {
    loadAssets();
  }, [user_id]);

  const handleSubmit = async () => {
    if (!selectedAsset) {
      toast.error("Please select an asset");
      return;
    }
    if (monthlyInvestment <= 0) {
      toast.error("Monthly investment must be greater than 0");
      return;
    }
    if (investmentMonths <= 0) {
      toast.error("Investment duration must be greater than 0");
      return;
    }

    const params: MonteCarloParams = {
      ticker: selectedAsset.id,
      monthly_investment: monthlyInvestment,
      investment_months: investmentMonths,
      simulation_method: simulationMethod,
    };

    setIsLoading(true);
    try {
      const data = await runMonteCarlo(params);
      setResults(data);
    } catch {
      // error toast handled in runMonteCarlo
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="monte-carlo-simulation">
      <h1 className="text-2xl font-semibold">Monte-Carlo Simulation</h1>
      <div className="mt-8 space-x-4 flex items-end">
        <div className="space-y-1">
          <Label>Asset</Label>
          <SingleAssetSelector
            assets={assets}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
          />
        </div>

        <div className="space-y-1">
          <Label>Simulation Method</Label>
          <MonteCarloStrategySelector
            selectedStrategy={simulationMethod}
            setSelectedStrategy={setSimulationMethod}
          />
        </div>

        <div className="space-y-1">
          <Label>Monthly Investment ($)</Label>
          <Input
            placeholder="e.g. 1000"
            type="number"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
            className={"w-100"}
          />
        </div>

        <div className="space-y-1">
          <Label>Investment Duration (months)</Label>
          <Input
            placeholder="e.g. 60"
            type="number"
            value={investmentMonths}
            onChange={(e) => setInvestmentMonths(Number(e.target.value))}
            className={"w-100"}
          />
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Running..." : "Run Simulation"}
        </Button>
      </div>

      {results && <MonteCarloResults results={results} />}
    </div>
  );
};

export { MonteCarloSimulation };
