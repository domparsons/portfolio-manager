import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import React from "react";
import { Cell, Pie, PieChart } from "recharts";
import { PortfolioHoldings } from "@/types/custom-types";
import { Spinner } from "@/components/ui/spinner";

const AssetAllocation = ({
  chartData,
  className,
  loading = false,
}: {
  chartData: PortfolioHoldings[];
  className: string;
  loading?: boolean;
}) => {
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#ff4242",
    "#8a42ff",
    "#42ff71",
    "#ff42d4",
    "#42d4ff",
    "#ffa742",
  ];

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    chartData.forEach((item, index) => {
      config[item.asset_name] = {
        label: item.asset_name,
        color: COLORS[index % COLORS.length],
      };
    });
    return config;
  }, [chartData]);

  return (
    <Card className={className}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Portfolio Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Spinner className={"size-5"} />
              <p className="text-sm text-gray-500">Loading allocation...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No holdings yet
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[350px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Pie data={chartData} dataKey="net_value" nameKey="asset_name">
                {" "}
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${chartData}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="asset_name" />}
                className="flex flex-wrap w-full"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm"></CardFooter>
    </Card>
  );
};

export { AssetAllocation };
