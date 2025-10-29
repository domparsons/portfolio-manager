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
import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { PortfolioHoldings } from "@/types/custom-types";

const Portfolio = () => {
  const [chartData, setChartData] = React.useState<PortfolioHoldings[]>([]);

  const user_id = localStorage.getItem("user_id");

  const getPortfolioHoldings = async () => {
    if (!user_id) return;

    try {
      const data = await apiClient.get(`/portfolio/holdings/${user_id}`);
      setChartData(data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Error fetching portfolio holdings:", apiError);
      toast("There was an error fetching portfolio holdings.");
    }
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#ff4242",
    "#8a42ff",
  ];

  React.useEffect(() => {
    getPortfolioHoldings();
  }, []);

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
      </div>
    </div>
  );
};

export { Portfolio };
