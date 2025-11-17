import { DCA_FREQUENCY_OPTIONS, DCAFrequencies } from "@/types/backtest-types";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FrequencySelector = ({
  frequency,
  setFrequency,
}: {
  frequency: DCAFrequencies;
  setFrequency: (value: DCAFrequencies) => void;
}) => {
  return (
    <Select
      value={frequency}
      onValueChange={(value) => setFrequency(value as DCAFrequencies)}
    >
      <SelectTrigger className="w-60">
        <SelectValue placeholder="Select a frequency" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Frequencies</SelectLabel>
          {DCA_FREQUENCY_OPTIONS.map((freq) => (
            <SelectItem key={freq} value={freq}>
              {freq.charAt(0).toUpperCase() + freq.slice(1)}{" "}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { FrequencySelector };
