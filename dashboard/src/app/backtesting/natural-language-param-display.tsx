import { Calendar, LucideIcon, SlidersHorizontal } from "lucide-react";

export const ParameterRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <span className="text-sm font-semibold">{value}</span>
  </div>
);

export const StrategyParameters = ({
  strategy,
  params,
}: {
  strategy: string;
  params: Record<string, any>;
}) => {
  if (strategy === "dca") {
    return (
      <div className="space-y-4">
        <ParameterRow
          icon={SlidersHorizontal}
          label="Amount per period"
          value={`$${params.amount_per_period}`}
        />
        <ParameterRow
          icon={Calendar}
          label="Frequency"
          value={
            params.frequency.charAt(0).toUpperCase() + params.frequency.slice(1)
          }
        />
      </div>
    );
  }

  if (strategy === "va") {
    return (
      <ParameterRow
        icon={SlidersHorizontal}
        label="Target increment"
        value={`$${params.target_increment_amount}`}
      />
    );
  }

  return (
    <span className="text-muted-foreground text-sm">
      No parameters required
    </span>
  );
};
