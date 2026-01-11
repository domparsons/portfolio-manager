import React from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { BanknoteArrowDown } from "lucide-react";

const EmptyComponent = ({
  title,
  description,
  icon: Icon = BanknoteArrowDown,
}: {
  title: string;
  description: string;
  icon?: React.ElementType;
}) => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{<Icon />}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export { EmptyComponent };
