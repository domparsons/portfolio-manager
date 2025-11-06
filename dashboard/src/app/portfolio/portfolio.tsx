import {
  Card,
  CardContent,
  CardDescription,
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
import { getPortfolioHoldings } from "@/api/portfolio";
import { usePortfolioMetrics } from "@/context/portfolio-context";

const Portfolio = () => {
  const [chartData, setChartData] = React.useState<PortfolioHoldings[]>([]);

  const { portfolioMetrics } = usePortfolioMetrics();
  const user_id = localStorage.getItem("user_id");

  React.useEffect(() => {
    if (user_id) {
      getPortfolioHoldings(user_id).then((data) => {
        if (data) setChartData(data);
      });
    }
  }, []);

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

  const getSharpeColor = (sharpe: number): string => {
    if (sharpe < 1.0) return "bg-red-500";
    if (sharpe < 2.0) return "bg-yellow-500";
    if (sharpe < 3.0) return "bg-green-500";
    return "bg-emerald-500";
  };

  const getSharpeWidth = (sharpe: number): number => {
    return Math.min((sharpe / 4.0) * 100, 100);
  };

  const getSharpeLabel = (sharpe: number): string => {
    if (sharpe === -1) return "";
    if (sharpe < 1.0) return "Poor";
    if (sharpe < 2.0) return "Good";
    if (sharpe < 3.0) return "Very Good";
    return "Excellent";
  };

  return (
    <div className="portfolio">
      <h1 className="text-2xl font-semibold">Portfolio</h1>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4 mt-4">
        <Card className="flex flex-col col-span-2">
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
                  content={<ChartTooltipContent />}
                />
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
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm"></CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <CardDescription className="text-xs">
              Risk-adjusted return
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center gap-3 justify-around">
            <div className="text-4xl font-bold">
              {portfolioMetrics?.sharpe.toFixed(2) ?? "--"}
            </div>
          </CardContent>
          <CardFooter>
            {" "}
            <div className="w-full">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getSharpeColor(portfolioMetrics?.sharpe ?? 0)}`}
                  style={{
                    width: `${getSharpeWidth(portfolioMetrics?.sharpe ?? 0)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                {getSharpeLabel(portfolioMetrics?.sharpe ?? -1)}
              </p>
            </div>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-sm font-medium">
              Maximum Drawdown
            </CardTitle>
            <CardDescription className="text-xs">Volatility</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center gap-3 justify-around">
            <div className="text-4xl font-bold">
              {portfolioMetrics?.max_drawdown.toFixed(2) ?? "--"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { Portfolio };
