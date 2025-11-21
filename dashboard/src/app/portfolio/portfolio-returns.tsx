import React from "react";
import { PortfolioHoldings } from "@/types/custom-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrencyValue, formatPercentageValue } from "@/utils/formatters";

const PortfolioReturns = ({
  holdings,
  className,
}: {
  holdings: PortfolioHoldings[];
  className?: string;
}) => {
  return (
    <Card className={`${className} h-96 flex flex-col`}>
      <CardHeader>
        <CardTitle>Portfolio Holdings</CardTitle>
        <CardDescription>Current positions and performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 overflow-auto flex-1">
        {holdings.map((holding) => {
          const isPositive = holding.unrealised_gain_loss >= 0;

          return (
            <div
              key={holding.asset_id}
              className="flex items-center justify-between border-b pb-3 last:border-b-0"
            >
              <div className="flex-1">
                <p className="font-medium">{holding.asset_name}</p>
                <p className="text-sm text-muted-foreground">
                  {holding.net_quantity_shares}{" "}
                  {holding.net_quantity_shares === 1 ? "share" : "shares"} @{" "}
                  {formatCurrencyValue(holding.average_cost_basis)}
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  {formatCurrencyValue(holding.net_value)}
                </p>
                <p
                  className={`text-sm ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrencyValue(holding.unrealised_gain_loss)} (
                  {formatPercentageValue(holding.unrealised_gain_loss_pct)})
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export { PortfolioReturns };
