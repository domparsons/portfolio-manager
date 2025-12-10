import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DatePicker = ({
  date,
  setDate,
  label,
  className,
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label: string;
  className?: string;
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={date}
          onSelect={(selectedDate) => {
            setDate(selectedDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export { DatePicker };
