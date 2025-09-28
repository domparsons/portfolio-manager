import React, { useState } from "react";
import { runMonteCarloSimulations } from "@/api/monte_carlo";
import { Button } from "@/components/ui/button";

const MonteCarloSimulation = () => {
  const [finalValues, setFinalValues] = useState<any[]>([]);
  const [portfolioPaths, setPortfolioPaths] = useState<any[]>([]);
  const [sharesAccumulated, setSharesAccumulated] = useState<any[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);

  return (
    <div className="monte-carlo-simulation">
      {" "}
      <h1 className="text-2xl font-semibold">Monte Carlo Simulation</h1>
      <Button
        onClick={async () => {
          try {
            const [
              finalValues = [],
              portfolioPaths = [],
              sharesAccumulated = [],
              totalInvested = 0,
            ] = (await runMonteCarloSimulations()) ?? [];
            setFinalValues(finalValues ?? []);
            setPortfolioPaths(portfolioPaths ?? []);
            setSharesAccumulated(sharesAccumulated ?? []);
            setTotalInvested(totalInvested ?? 0);
          } catch (err: any) {
            alert("Error: " + err.message);
          }
        }}
      >
        Button
      </Button>
      <div className={"flex flex-col"}>
        <p>{finalValues[0]}</p>
        <p>{portfolioPaths[0]}</p>
        <p>{sharesAccumulated[0]}</p>
        <p>{totalInvested}</p>
      </div>
    </div>
  );
};

export { MonteCarloSimulation };
