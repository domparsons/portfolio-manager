import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Volatility = ({ volatility }: { volatility: number | null }) => {
  const getVolatilityColor = (vol: number): string => {
    if (vol <= 15) return "text-green-600";
    if (vol <= 25) return "text-yellow-600";
    if (vol <= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm font-medium">Volatility</CardTitle>
        <CardDescription className="text-xs">Annualised</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center gap-3 justify-around">
        <div
          className={`text-4xl font-bold ${getVolatilityColor(
            volatility != null ? volatility : 0,
          )}`}
        >
          {volatility != null ? `${volatility.toFixed(2)}%` : "--"}
        </div>
      </CardContent>
    </Card>
  );
};

export { Volatility };
