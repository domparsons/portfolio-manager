import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

const ResultValues = ({
  finalValue,
  absoluteReturn,
  percentageReturn,
}: {
  finalValue: number | null;
  absoluteReturn: number | null;
  percentageReturn: number | null;
}) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm font-medium">Final Value</CardTitle>
        <CardDescription className="text-xs">
          Absolute and percentage returns
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold">${finalValue?.toFixed(2)}</div>
        <div
          className={`font-bold ${
            absoluteReturn && absoluteReturn > 0
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {absoluteReturn && absoluteReturn > 0 ? "+" : "-"} $
          {Math.abs(Number(absoluteReturn?.toFixed(2)))} (
          {((percentageReturn ?? 0) * 100).toFixed(2)}%)
        </div>
      </CardContent>
    </Card>
  );
};

export { ResultValues };
