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
}: {
  title: string;
  description: string;
}) => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{<BanknoteArrowDown />}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export { EmptyComponent };
