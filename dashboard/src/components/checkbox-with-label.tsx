import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CheckboxWithLabelProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

const CheckboxWithLabel: React.FC<CheckboxWithLabelProps> = ({
  checked,
  onCheckedChange,
  label,
}) => {
  return (
    <div className={"flex flex-row space-x-2 items-center"}>
      <Checkbox
        checked={checked}
        onCheckedChange={(checked) => {
          onCheckedChange(checked === true);
        }}
      />
      <Label>{label}</Label>
    </div>
  );
};

export { CheckboxWithLabel };
