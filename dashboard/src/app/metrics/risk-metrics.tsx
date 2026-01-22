import { Activity, BarChart3, Calendar, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const RiskMetrics = ({
  sharpe,
  maxDrawdown,
  maxDrawdownDuration,
  volatility,
  className,
  loading = false,
}: {
  sharpe: number | null;
  maxDrawdown: number | null;
  maxDrawdownDuration: number | null;
  volatility: number | null;
  className?: string;
  loading?: boolean;
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
      educationalInsight: {
        description:
          "Measures risk-adjusted return. Higher values indicate better returns relative to the risk taken.",
        ranges: [
          { label: "Excellent", threshold: "> 3", color: "text-green-500" },
          { label: "Very Good", threshold: "2 - 3", color: "text-green-500" },
          { label: "Good", threshold: "1 - 2", color: "text-blue-500" },
          { label: "Fair", threshold: "0 - 1", color: "text-yellow-500" },
          { label: "Poor", threshold: "< 0", color: "text-red-500" },
        ],
      },
    },
    {
      label: "Maximum Drawdown",
      value: maxDrawdown ? `${(maxDrawdown * 100).toFixed(2)}%` : "—",
      description: "Peak-to-trough decline",
      rating: drawdownRating,
      icon: TrendingDown,
      educationalInsight: {
        description:
          "The largest peak-to-trough decline. Lower absolute values are better.",
        ranges: [
          { label: "Minimal", threshold: "> -5%", color: "text-green-500" },
          { label: "Low", threshold: "-5% to -10%", color: "text-green-500" },
          {
            label: "Moderate",
            threshold: "-10% to -20%",
            color: "text-yellow-500",
          },
          { label: "High", threshold: "< -20%", color: "text-red-500" },
        ],
      },
    },
    {
      label: "Maximum Drawdown Duration",
      value: maxDrawdown ? `${maxDrawdownDuration}` : "—",
      description: "Trading days",
      rating: drawdownRating,
      icon: Calendar,
      educationalInsight: {
        description:
          "Number of trading days in the longest drawdown period. Shorter durations indicate faster recovery.",
        ranges: [
          {
            label: "Quick Recovery",
            threshold: "< 20 days",
            color: "text-green-500",
          },
          {
            label: "Moderate",
            threshold: "20-60 days",
            color: "text-yellow-500",
          },
          { label: "Extended", threshold: "> 60 days", color: "text-red-500" },
        ],
      },
    },
    {
      label: "Volatility",
      value: volatility ? `${(volatility * 100).toFixed(2)}%` : "—",
      description: "Annualized",
      rating: volatilityRating,
      icon: BarChart3,
      educationalInsight: {
        description:
          "Measures how much returns fluctuate over time. Lower volatility means more stable returns.",
        ranges: [
          { label: "Very Low", threshold: "< 10%", color: "text-green-500" },
          { label: "Low", threshold: "10% - 20%", color: "text-green-500" },
          {
            label: "Moderate",
            threshold: "20% - 30%",
            color: "text-yellow-500",
          },
          { label: "High", threshold: "> 30%", color: "text-red-500" },
        ],
      },
    },
  ];

  return (
    <Card className={`${className} flex flex-col`}>
      <CardHeader>
        <CardTitle>Risk Metrics</CardTitle>
        <CardDescription>Risk and return characteristics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Spinner className={"size-5"} />
              <p className="text-sm text-gray-500">Loading metrics...</p>
            </div>
          </div>
        ) : (
          <>
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-sm text-muted-foreground">
                          {metric.label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {metric.educationalInsight.description}
                          </p>
                          <div className="space-y-1.5">
                            <p className="text-xs text-muted-foreground">
                              Guide:
                            </p>
                            {metric.educationalInsight.ranges.map(
                              (range, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-4 text-xs"
                                >
                                  <span
                                    className={`font-medium ${range.color}`}
                                  >
                                    {range.label}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {range.threshold}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span
                    className={`text-sm font-semibold ${metric.rating.color}`}
                  >
                    {metric.value}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </CardContent>
      <CardFooter className={"text-sm text-muted-foreground"}>
        <a href={"/learn"}>
          <div>Learn more about risk metrics →</div>
        </a>
      </CardFooter>
    </Card>
  );
};

export { RiskMetrics };
