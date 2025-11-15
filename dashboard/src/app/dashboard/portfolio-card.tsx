import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PortfolioCardProps } from "@/types/custom-types";
import { TimeseriesChart } from "@/app/metrics/timeseries-chart";

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolioHistory,
  startDate,
  endDate,
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
        <TimeseriesChart
          chartData={portfolioHistory}
          minDomain={minDomain}
          maxDomain={maxDomain}
        />
      </CardContent>
    </Card>
  );
};

export { PortfolioCard };
