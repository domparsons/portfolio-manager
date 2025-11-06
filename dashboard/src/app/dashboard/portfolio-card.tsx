import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { PortfolioCardProps } from "@/types/custom-types";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolioHistory,
  startDate,
  endDate,
  chartConfig,
  minDomain,
  maxDomain,
}) => {
  return (
    <Card className={"mt-4 col-span-2"}>
      <CardHeader>
        <CardTitle>Portfolio</CardTitle>
        <CardDescription>
          {portfolioHistory.length > 0
            ? `${startDate} - ${endDate}`
            : "No data available"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={"h-64 w-full"}>
          <LineChart
            accessibilityLayer
            data={portfolioHistory}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              dataKey="value"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[minDomain, maxDomain]}
            />
            <XAxis
              dataKey="date"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(timestamp) => {
                return new Date(timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) {
                  return null;
                }

                const data = payload[0].payload;
                const date = new Date(data.date);

                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="font-bold text-foreground">
                          ${data.value.toFixed(2)}
                        </span>
                        {data.daily_return_pct !== undefined &&
                          data.daily_return_pct !== 0 && (
                            <span
                              className={`text-xs ${
                                data.daily_return_pct >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {(data.daily_return_pct * 100).toFixed(2)}%
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Line
              dataKey="value"
              type="linear"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export { PortfolioCard };
