import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PortfolioCardProps, TimeseriesChartData } from "@/types/custom-types";
import { TimeseriesChart } from "@/app/metrics/timeseries-chart";

const PortfolioCard = ({
  portfolioHistory,
  startDate,
  endDate,
  minDomain,
  maxDomain,
  className,
}: {
  portfolioHistory: TimeseriesChartData[];
  startDate: string;
  endDate: string;
  minDomain: number;
  maxDomain: number;
  className?: string;
}) => {
  return (
    <Card className={className}>
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
