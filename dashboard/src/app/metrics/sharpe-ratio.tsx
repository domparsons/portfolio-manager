import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

const SharpeRatio = ({ sharpeRatio }: { sharpeRatio: number | null }) => {
  const getSharpeColor = (sharpe: number): string => {
    if (sharpe < 0) return "bg-red-500";
    if (sharpe < 1.0) return "bg-orange-500";
    if (sharpe < 2.0) return "bg-yellow-500";
    if (sharpe < 3.0) return "bg-green-500";
    return "bg-emerald-500";
  };

  const getSharpeWidth = (sharpe: number): number => {
    if (sharpe < 0) return 0; // No bar for negative
    return Math.min((sharpe / 4.0) * 100, 100);
  };

  const getSharpeLabel = (sharpe: number): string => {
    if (sharpe === -1) return "";
    if (sharpe === 0)
      return "Cannot calculate Sharpe Ratio with zero-volatility portfolio";
    if (sharpe < 0) return "Negative Returns";
    if (sharpe < 1.0) return "Poor";
    if (sharpe < 2.0) return "Good";
    if (sharpe < 3.0) return "Very Good";
    return "Excellent";
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
        <CardDescription className="text-xs">
          Risk-adjusted return
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center gap-3 justify-around p-6">
        <div className="text-4xl font-bold">
          {sharpeRatio != null ? sharpeRatio.toFixed(2) : "--"}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${getSharpeColor(sharpeRatio ?? 0)}`}
              style={{
                width: `${getSharpeWidth(sharpeRatio ?? 0)}%`,
              }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {getSharpeLabel(sharpeRatio ?? -1)}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export { SharpeRatio };
