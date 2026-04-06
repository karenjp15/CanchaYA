"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getMonthGrid,
  WEEKDAY_LABELS,
  MONTH_NAMES_ES,
  toBogotaDateString,
  todayBogota,
} from "@/lib/date-utils";
import { cn } from "@/lib/utils";

type MiniCalendarProps = {
  selected: string | null;
  onSelect: (dateStr: string) => void;
};

export function MiniCalendar({ selected, onSelect }: MiniCalendarProps) {
  const today = useMemo(() => todayBogota(), []);
  const todayStr = useMemo(() => toBogotaDateString(today), [today]);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const cells = useMemo(() => getMonthGrid(year, month), [year, month]);

  function prev() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }
  function next() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <div className="w-full select-none">
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={prev}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold">
          {MONTH_NAMES_ES[month]} {year}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={next}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((l, i) => (
          <span key={i} className="py-1">{l}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center text-sm">
        {cells.map((day, i) => {
          if (day === null) {
            return <span key={`e${i}`} />;
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isPast = dateStr < todayStr;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selected;

          return (
            <button
              key={dateStr}
              disabled={isPast}
              onClick={() => onSelect(dateStr)}
              className={cn(
                "mx-auto flex size-8 items-center justify-center rounded-full text-sm transition-colors",
                isPast && "text-muted-foreground/40 cursor-not-allowed",
                !isPast && !isSelected && "hover:bg-muted",
                isToday && !isSelected && "font-bold text-primary",
                isSelected && "bg-primary text-primary-foreground font-semibold",
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
