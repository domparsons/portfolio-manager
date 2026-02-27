import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { PortfolioHoldings } from "@/types/custom-types";
import { getPortfolioHoldings, runRebalanceSuggestion } from "@/api/portfolio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Allocation {
  ticker: string;
  current_weight: number;
  suggested_weight: number;
  change: number;
  rationale: string;
}

interface RebalancingResult {
  allocations: Allocation[];
  summary: string;
  caveats: string;
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const AllocationRow = ({ a }: { a: Allocation }) => {
  const isIncrease = a.change > 0.0005;
  const isDecrease = a.change < -0.0005;
  const changeLabel = `${Math.abs(a.change * 100).toFixed(1)}%`;
  const changeColor = isIncrease
    ? "text-green-500"
    : isDecrease
      ? "text-red-500"
      : "text-muted-foreground";
  const targetBarColor = isIncrease
    ? "bg-green-500"
    : isDecrease
      ? "bg-red-500"
      : "bg-primary";

  return (
    <div className="py-3 border-b last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm">{a.ticker}</span>
        <span className={`text-sm font-medium ${changeColor}`}>
          {isIncrease ? "▲" : isDecrease ? "▼" : "—"} {changeLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Current</span>
            <span>{pct(a.current_weight)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-muted-foreground/40"
              style={{ width: `${a.current_weight * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Target</span>
            <span className="font-medium">{pct(a.suggested_weight)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${targetBarColor}`}
              style={{ width: `${a.suggested_weight * 100}%` }}
            />
          </div>
        </div>
      </div>

      {a.rationale && (
        <p className="text-xs text-muted-foreground italic">{a.rationale}</p>
      )}
    </div>
  );
};

const PortfolioRebalancing = () => {
  const { user } = useAuth0();
  const user_id = user?.sub ?? null;
  const [portfolioHoldings, setPortfolioHoldings] = React.useState<
    PortfolioHoldings[]
  >([]);
  const [holdingsLoading, setHoldingsLoading] = React.useState<boolean>(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [userGoals, setUserGoals] = useState<string>("");
  const [rebalancingResults, setRebalancingResults] =
    useState<RebalancingResult | null>(null);

  React.useEffect(() => {
    if (user_id) {
      setHoldingsLoading(true);
      getPortfolioHoldings()
        .then((data) => {
          if (data) {
            setPortfolioHoldings(data);
          }
        })
        .finally(() => {
          setHoldingsLoading(false);
        });
    } else {
      setHoldingsLoading(false);
    }
  }, [user_id]);

  const handleRebalanceSubmit = async () => {
    setIsLoadingSuggestions(true);
    const totalValue = portfolioHoldings.reduce(
      (sum, holding) => sum + holding.net_value,
      0,
    );

    const allocation = portfolioHoldings.reduce(
      (acc, holding) => {
        const assetName = holding.asset_name;
        acc[assetName] = holding.net_value / totalValue;
        return acc;
      },
      {} as Record<string, number>,
    );

    try {
      const raw = await runRebalanceSuggestion(userGoals, allocation);
      if (raw) setRebalancingResults(JSON.parse(raw) as RebalancingResult);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <div className="portfolio-rebalancing">
      <h1 className="text-2xl font-semibold">
        Portfolio Allocation Suggestions
      </h1>
      <div className={"mt-4"}>
        <p>
          Describe your investment goals and risk tolerance in plain English.
          Based on your current holdings, AI will suggest a target allocation
          and explain its reasoning.
        </p>

        <Field>
          <FieldLabel htmlFor="textarea-message">Investment Goals</FieldLabel>
          <FieldDescription>
            For example: "I'm 28, high risk tolerance, bullish on tech" or "I
            want a more conservative allocation, I'm close to retirement"
          </FieldDescription>
          <Textarea
            id="textarea-message"
            placeholder="Describe your investment goals..."
            value={userGoals}
            onChange={(e) => setUserGoals(e.target.value)}
          />
        </Field>

        <Button
          className="mt-4"
          onClick={handleRebalanceSubmit}
          disabled={isLoadingSuggestions}
        >
          {isLoadingSuggestions ? "Running..." : "Get Suggestions"}
        </Button>

        {rebalancingResults && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Summary</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {rebalancingResults.summary}
              </p>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Suggested Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                {rebalancingResults.allocations.map((a) => (
                  <AllocationRow key={a.ticker} a={a} />
                ))}
              </CardContent>
            </Card>

            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-sm font-semibold mb-1">
                Things to keep in mind
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {rebalancingResults.caveats}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { PortfolioRebalancing };
