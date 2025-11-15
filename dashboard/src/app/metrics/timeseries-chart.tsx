import React from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { TimeseriesChartData } from "@/types/custom-types";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const TimeseriesChart = ({
  chartData,
  minDomain,
  maxDomain,
}: {
  chartData: TimeseriesChartData[];
  minDomain: number;
  maxDomain: number;
}) => {
  const chartConfig = {
    value: {
      label: "Value",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const transformedData = chartData.map((item: TimeseriesChartData) => ({
    ...item,
    timestamp: new Date(item.date).getTime(),
  }));

  return (
    <ChartContainer config={chartConfig} className={"h-64 w-full"}>
      <LineChart
        accessibilityLayer
        data={transformedData}
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
          tickFormatter={(value) => value.toFixed(0)}
        />
        <XAxis
          dataKey="timestamp"
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
  );
};

export { TimeseriesChart };
