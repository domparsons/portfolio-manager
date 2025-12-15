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
import { Loader2 } from "lucide-react";

const PortfolioCard = ({
  portfolioHistory,
  startDate,
  endDate,
  minDomain,
  maxDomain,
  className,
  loading = false,
}: {
  portfolioHistory: TimeseriesChartData[];
  startDate: string;
  endDate: string;
  minDomain: number;
  maxDomain: number;
  className?: string;
  loading?: boolean;
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Portfolio</CardTitle>
        <CardDescription>
          {loading
            ? "Loading..."
            : portfolioHistory.length > 0
              ? `${startDate} - ${endDate}`
              : "No data available"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <p className="text-sm text-gray-500">Loading portfolio...</p>
            </div>
          </div>
        ) : portfolioHistory.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No portfolio history yet
          </div>
        ) : (
          <TimeseriesChart
            chartData={portfolioHistory}
            minDomain={minDomain}
            maxDomain={maxDomain}
          />
        )}
      </CardContent>
    </Card>
  );
};

export { PortfolioCard };
