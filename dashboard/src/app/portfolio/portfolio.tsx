import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import React from "react";
import { Pie, PieChart } from "recharts";
const chartConfig = {} satisfies ChartConfig;
const Portfolio = () => {
  const [chartData, setChartData] = React.useState([]);

  const user_id = localStorage.getItem("user_id");

  const getPortfolioHoldings = async () => {
    const response = await fetch(
      `http://localhost:8000/portfolio/holdings/${user_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    setChartData(data);
  };

  React.useEffect(() => {
    getPortfolioHoldings();
  }, []);

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
                <Pie
                  data={chartData}
                  dataKey="net_quantity"
                  nameKey="asset_name"
                  // Assign a color to each slice using a color array
                  fill="#8884d8"
                  stroke="#fff"
                  cx="50%"
                  cy="50%"
                >
                </Pie>{" "}
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by *** this month <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export { Portfolio };
