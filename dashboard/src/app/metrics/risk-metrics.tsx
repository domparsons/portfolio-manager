import { Activity, TrendingDown, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

const RiskMetrics = ({
  sharpe,
  maxDrawdown,
  volatility,
  className,
}: {
  sharpe: number | null;
  maxDrawdown: number | null;
  volatility: number | null;
  className?: string;
}) => {
  const getSharpeRating = (value: number | null) => {
    if (!value) return { label: "—", color: "text-muted-foreground" };
    if (value > 3) return { label: "Excellent", color: "text-green-500" };
    if (value > 2) return { label: "Very Good", color: "text-green-500" };
    if (value > 1) return { label: "Good", color: "text-blue-500" };
    if (value > 0) return { label: "Fair", color: "text-yellow-500" };
    return { label: "Poor", color: "text-red-500" };
  };

  const getDrawdownRating = (value: number | null) => {
    if (!value) return { label: "—", color: "text-muted-foreground" };
    if (value > -0.05) return { label: "Minimal", color: "text-green-500" };
    if (value > -0.1) return { label: "Low", color: "text-green-500" };
    if (value > -0.2) return { label: "Moderate", color: "text-yellow-500" };
    return { label: "High", color: "text-red-500" };
  };

  const getVolatilityRating = (value: number | null) => {
    if (!value) return { label: "—", color: "text-muted-foreground" };
    if (value < 0.1) return { label: "Very Low", color: "text-green-500" };
    if (value < 0.2) return { label: "Low", color: "text-green-500" };
    if (value < 0.3) return { label: "Moderate", color: "text-yellow-500" };
    return { label: "High", color: "text-red-500" };
  };

  const sharpeRating = getSharpeRating(sharpe);
  const drawdownRating = getDrawdownRating(maxDrawdown);
  const volatilityRating = getVolatilityRating(volatility);

  const metrics = [
    {
      label: "Sharpe Ratio",
      value: sharpe?.toFixed(2) ?? "—",
      description: "Risk-adjusted return",
      rating: sharpeRating,
      icon: Activity,
    },
    {
      label: "Maximum Drawdown",
      value: maxDrawdown ? `${(maxDrawdown * 100).toFixed(2)}%` : "—",
      description: "Peak-to-trough decline",
      rating: drawdownRating,
      icon: TrendingDown,
    },
    {
      label: "Volatility",
      value: volatility ? `${(volatility * 100).toFixed(2)}%` : "—",
      description: "Annualized",
      rating: volatilityRating,
      icon: BarChart3,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Risk Metrics</CardTitle>
        <CardDescription>Risk and return characteristics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {metric.label}
                </span>
              </div>
              <span className={`text-sm font-semibold ${metric.rating.color}`}>
                {metric.value}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export { RiskMetrics };
