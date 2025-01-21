import React from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
const chartConfig = {
  assets: {
    label: "Assets",
  },
  apple: {
    label: "Apple",
    color: "hsl(var(--chart-1))",
  },
  tesla: {
    label: "Tesla",
    color: "hsl(var(--chart-2))",
  },
  nvidia: {
    label: "Nvidia",
    color: "hsl(var(--chart-3))",
  },
  amazon: {
    label: "Amazon",
    color: "hsl(var(--chart-4))",
  },
  google: {
    label: "Google",
    color: "hsl(var(--chart-5))",
  },
  microsoft: {
    label: "Microsoft",
    color: "hsl(var(--chart-6))",
  },
  facebook: {
    label: "Facebook",
    color: "hsl(var(--chart-7))",
  },
  netflix: {
    label: "Netflix",
    color: "hsl(var(--chart-8))",
  },
} satisfies ChartConfig;
const Portfolio = () => {
  const chartData = [
    { asset: "Apple", value: 1500, fill: "var(--color-apple)" },
    { asset: "Tesla", value: 1200, fill: "var(--color-tesla)" },
    { asset: "Nvidia", value: 1000, fill: "var(--color-nvidia)" },
    { asset: "Amazon", value: 900, fill: "var(--color-amazon)" },
    { asset: "Google", value: 800, fill: "var(--color-google)" },
    { asset: "Microsoft", value: 700, fill: "var(--color-microsoft)" },
    { asset: "Facebook", value: 600, fill: "var(--color-facebook)" },
    { asset: "Netflix", value: 500, fill: "var(--color-netflix)" },
  ];

  return (
    <div className="portfolio">
      <h1 className="text-2xl font-semibold">Portfolio</h1>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 mt-4">
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Portfolio Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={chartData} dataKey="value" nameKey="asset" />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total visitors for the last 6 months
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export { Portfolio };
