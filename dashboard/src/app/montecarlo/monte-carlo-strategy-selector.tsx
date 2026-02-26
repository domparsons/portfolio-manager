import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MONTE_CARLO_STRATEGY_NAMES,
  MonteCarloStrategies,
} from "@/types/monte-carlo-types";

const MonteCarloStrategySelector = ({
  selectedStrategy,
  setSelectedStrategy,
}: {
  selectedStrategy: MonteCarloStrategies;
  setSelectedStrategy: (strategy: MonteCarloStrategies) => void;
}) => {
  return (
    <Select
      value={selectedStrategy}
      onValueChange={(value) =>
        setSelectedStrategy(value as MonteCarloStrategies)
      }
    >
      <SelectTrigger className="w-60">
        <SelectValue placeholder="Select a simulation method" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Simulation Method</SelectLabel>
          {(
            Object.keys(MONTE_CARLO_STRATEGY_NAMES) as MonteCarloStrategies[]
          ).map((strategy) => (
            <SelectItem key={strategy} value={strategy}>
              {MONTE_CARLO_STRATEGY_NAMES[strategy]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { MonteCarloStrategySelector };
