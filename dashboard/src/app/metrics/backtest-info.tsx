import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { formatCurrencyValue } from "@/utils/formatters";
import { TrendingUp, CalendarDays, Repeat } from "lucide-react";

const BacktestInfo = ({
  totalInvested,
  investmentsMade,
  daysAnalysed,
}: {
  totalInvested: number | null;
  investmentsMade: number | null;
  daysAnalysed: number | null;
}) => {
  const stats = [
    {
      label: "Total Invested",
      value: formatCurrencyValue(totalInvested),
      icon: TrendingUp,
    },
    {
      label: "Investments Made",
      value: investmentsMade ?? "—",
      icon: Repeat,
    },
    {
      label: "Days Analyzed",
      value: daysAnalysed ?? "—",
      icon: CalendarDays,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backtest Summary</CardTitle>
        <CardDescription>Overview of simulation parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <span className="text-sm font-semibold">{stat.value}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export { BacktestInfo };
