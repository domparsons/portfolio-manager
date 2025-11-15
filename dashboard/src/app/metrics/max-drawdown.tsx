import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

const MaxDrawdown = ({ maxDrawdown }: { maxDrawdown: number | null }) => {
  const getDrawdownColor = (drawdown: number): string => {
    if (drawdown >= -0.05) return "text-green-600";
    if (drawdown >= -0.15) return "text-yellow-600";
    if (drawdown >= -0.3) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm font-medium">Maximum Drawdown</CardTitle>
        <CardDescription className="text-xs">
          Peak-to-Trough Decline
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center gap-3 justify-around">
        <div
          className={`text-4xl font-bold ${getDrawdownColor(
            maxDrawdown != null ? maxDrawdown : 0,
          )}`}
        >
          {maxDrawdown != null ? `${(maxDrawdown * 100).toFixed(2)}%` : "--"}
        </div>
      </CardContent>
    </Card>
  );
};

export { MaxDrawdown };
