import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrencyValue } from "@/utils/formatters";
import React from "react";
import { Spinner } from "@/components/ui/spinner";

const ResultValues = ({
  finalValue,
  absoluteReturn,
  percentageReturn,
  title,
  className,
  loading = false,
}: {
  finalValue: number | null;
  absoluteReturn: number | null;
  percentageReturn: number | null;
  title: string;
  className?: string;
  loading?: boolean;
}) => {
  const isPositive = (absoluteReturn ?? 0) > 0;
  const isNegative = (absoluteReturn ?? 0) < 0;

  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive
    ? "text-green-500"
    : isNegative
      ? "text-red-500"
      : "text-muted-foreground";

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Portfolio value and returns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Spinner className={"size-5"} />
              <p className="text-sm text-gray-500">Loading portfolio...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {formatCurrencyValue(finalValue)}
            </div>

            <div
              className={`flex items-center gap-1.5 text-sm font-semibold ${colorClass}`}
            >
              {absoluteReturn !== 0 && <Icon className="h-4 w-4" />}
              <span>
                {isPositive && "+"}
                {formatCurrencyValue(absoluteReturn)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({((percentageReturn ?? 0) * 100).toFixed(2)}%)
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export { ResultValues };
