import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, YAxis } from "recharts";
import * as React from "react";
interface Portfolio {
  id: number;
  close: number;
  timestamp: string;
}

const AssetChart = ({ data }: { data: Portfolio[] | null }) => {
  const chartData: Portfolio[] = data ?? [];
  const minValue = Math.min(...chartData.map((item) => item.close));
  const maxValue = Math.max(...chartData.map((item) => item.close));
  const padding = 5;

  const minDomain = minValue - padding;
  const maxDomain = maxValue + padding;

  const chartConfig = {
    value: {
      label: "close",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-4">
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }} // Adjusted margin to remove left gap
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />

          <YAxis
            dataKey="close" // Set the data key for the Y-Axis
            tick={false} // Hide tick marks
            axisLine={false} // Hide the axis line
            tickMargin={0} // Optional: remove any margin between ticks and chart area
            domain={[minDomain, maxDomain]} // Ensure the line fills the chart area
            label={{
              value: "Price (USD)", // Add a label for the Y-Axis
              position: "insideLeft", // Position the label inside the chart area
              angle: -90, // Rotate the label if needed
              offset: 10, // Adjust the distance from the axis
            }}
          />
          <Line
            dataKey="close"
            type="natural"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default AssetChart;
