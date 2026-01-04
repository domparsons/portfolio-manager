import React from "react";
import { formatCurrencyValue, formatPercentageValue } from "@/utils/formatters";

interface PortfolioSummaryProps {
  currentValue: number | undefined;
  totalReturnAbs: number | undefined;
  totalReturnPct: number | undefined;
  loading: boolean;
  error: string | null;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  currentValue,
  totalReturnAbs,
  totalReturnPct,
  loading,
  error,
}) => {
  const getReturnText = () => {
    if (loading || error || totalReturnAbs === undefined) {
      return "";
    }

    const isPositive = totalReturnAbs >= 0;
    const formattedValue = formatCurrencyValue(Math.abs(totalReturnAbs));
    const formattedPercentage = formatPercentageValue(totalReturnPct ?? 0);

    return isPositive
      ? `+${formattedValue} (${formattedPercentage})`
      : `-${formattedValue} (${formattedPercentage})`;
  };

  return (
    <div className="flex flex-col justify-between mt-4 mb-2">
      <div className="flex flex-row space-x-2 items-center">
        <h2 className="text-xl font-semibold">
          {formatCurrencyValue(currentValue ?? null)}
        </h2>
        <p
          className={`font-semibold ${
            totalReturnAbs !== undefined && totalReturnAbs >= 0
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {getReturnText()}
        </p>
      </div>
      <p>Portfolio Value</p>
    </div>
  );
};

export default PortfolioSummary;
