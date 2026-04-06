"use client";

import { cn } from "@/lib/utils";

type Slot = {
  time: string;
  label: string;
  available: boolean;
};

type TimeSlotPickerProps = {
  dateLabel: string;
  slots: Slot[];
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
          return (
            <button
              key={slot.time}
              disabled={!slot.available}
              onClick={() => onSelect(slot.time)}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-all",
                slot.available && !isSelected &&
                  "border-border bg-background hover:border-primary/40 hover:bg-primary/5",
                slot.available && isSelected &&
                  "border-warning bg-warning/10 text-warning ring-1 ring-warning/30",
                !slot.available &&
                  "cursor-not-allowed border-border/40 bg-destructive/5 text-muted-foreground/40 line-through",
              )}
            >
              {slot.label}
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
