import React from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { TimeseriesChartData } from "@/types/custom-types";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const TimeseriesChart = ({
  chartData,
  minDomain,
  maxDomain,
}: {
  chartData: TimeseriesChartData[];
  minDomain: number;
  maxDomain: number;
}) => {
  const isMobile = useIsMobile();

  const chartConfig = {
    value: {
      label: "Value",
      color: "#8b5cf6",
    },
  } satisfies ChartConfig;

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 md:h-64 text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  const transformedData = chartData.map((item: TimeseriesChartData) => ({
    ...item,
    timestamp: new Date(item.date).getTime(),
  }));

  return (
    <ChartContainer config={chartConfig} className={"h-80 md:h-64 w-full"}>
      <LineChart
        accessibilityLayer
        data={transformedData}
        margin={isMobile ? {
          left: 10,
          right: 10,
          top: 5,
          bottom: 5,
        } : {
          left: 20,
          right: 20,
          top: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} />
        <YAxis
          dataKey="value"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[minDomain, maxDomain]}
          tickCount={isMobile ? 4 : 6}
          tickFormatter={(value) =>
            `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
          }
        />
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={40}
          tickCount={isMobile ? 6 : 12}
          tickFormatter={(timestamp) => {
            return new Date(timestamp).toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
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
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
};

export { TimeseriesChart };
