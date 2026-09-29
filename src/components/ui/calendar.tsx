import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  mode?: "single";
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  modifiers?: { booked?: Date[] };
  modifiersClassNames?: Record<string, string>;
  numberOfMonths?: number;
  className?: string;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBooked(date: Date, booked: Date[]) {
  return booked.some((d) => isSameDay(d, date));
}

export function Calendar({
  selected,
  onSelect,
  modifiers,
  className,
}: CalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());
  const [viewYear, setViewYear] = React.useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const bookedDates = modifiers?.booked ?? [];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="h-7 w-7 flex items-center justify-center rounded-md opacity-50 hover:opacity-100 hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="h-7 w-7 flex items-center justify-center rounded-md opacity-50 hover:opacity-100 hover:bg-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="h-9 w-9 flex items-center justify-center text-[0.8rem] text-muted-foreground font-normal"
          >
            {day}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-9 w-9" />;
          }

          const date = new Date(viewYear, viewMonth, day);
          const isSelected = selected ? isSameDay(date, selected) : false;
          const isToday = isSameDay(date, today);
          const isBookedDate = isBooked(date, bookedDates);

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect?.(date)}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-md text-sm font-normal",
                "hover:bg-accent",
                isToday && "bg-accent text-accent-foreground font-medium",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                isBookedDate &&
                  !isSelected &&
                  "bg-gold-500 text-black font-medium rounded-md"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
