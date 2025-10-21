import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 25 }).map((_, index) => <Skeleton key={index} className="h-[28px] rounded-full" />)}
    </div>
  );
};

export { TableSkeleton };
