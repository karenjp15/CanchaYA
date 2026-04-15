"use client";

import { Badge } from "@/components/ui/badge";
import type { TimeSlotWithFlash } from "@/lib/utils/pricing";
import { cn } from "@/lib/utils";

type TimeSlotPickerProps = {
  dateLabel: string;
  slots: TimeSlotWithFlash[];
  selected: string | null;
  onSelect: (time: string) => void;
};

export function TimeSlotPicker({
  dateLabel,
  slots,
  selected,
  onSelect,
}: TimeSlotPickerProps) {
  return (
    <div className="flex flex-col">
      <p className="mb-3 text-sm font-semibold capitalize">{dateLabel}</p>
      <div className="flex flex-col gap-1.5">
        {slots.map((slot) => {
          const isSelected = slot.time === selected;
          const flash = slot.flashDiscountPercent;
          const hasFlash = slot.available && flash != null && flash > 0;
          return (
            <button
              key={slot.time}
              disabled={!slot.available}
              onClick={() => onSelect(slot.time)}
              className={cn(
                "relative flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all",
                slot.available &&
                  !isSelected &&
                  !hasFlash &&
                  "border-border bg-background hover:border-primary/40 hover:bg-primary/5",
                slot.available &&
                  !isSelected &&
                  hasFlash &&
                  "border-amber-500/55 bg-amber-500/10 text-amber-950 shadow-[0_0_0_1px_rgba(245,158,11,0.25)] hover:border-amber-500 hover:bg-amber-500/15 dark:text-amber-50",
                slot.available &&
                  isSelected &&
                  !hasFlash &&
                  "border-warning bg-warning/10 text-warning ring-1 ring-warning/30",
                slot.available &&
                  isSelected &&
                  hasFlash &&
                  "border-amber-500 bg-amber-500/20 text-amber-950 ring-2 ring-amber-500/50 dark:text-amber-50",
                !slot.available &&
                  "cursor-not-allowed border-border/40 bg-destructive/5 text-muted-foreground/40 line-through",
              )}
            >
              {hasFlash ? (
                <Badge
                  variant="outline"
                  className="pointer-events-none absolute left-2 border-amber-500/60 bg-amber-500/15 px-1.5 py-0 text-[10px] font-bold text-amber-700 dark:text-amber-300"
                >
                  -{Math.round(flash)}%
                </Badge>
              ) : null}
              <span>{slot.label}</span>
              {!slot.available && (
                <span className="ml-1.5 text-[10px] no-underline text-destructive/60">
                  Ocupado
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
