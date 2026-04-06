"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GridBooking } from "@/lib/data/admin";
import { fetchWeekBookings } from "@/actions/admin-dashboard";
import type { BookingStatus } from "@/types/database.types";

const DAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_SHORT = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const START_HOUR = 6;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function formatHour(h: number) {
  if (h === 0) return "12 am";
  if (h < 12) return `${h} am`;
  if (h === 12) return "12 pm";
  return `${h - 12} pm`;
}

function getWeekDates(offsetWeeks: number) {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + offsetWeeks * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getMondayISO(offsetWeeks: number): string {
  const dates = getWeekDates(offsetWeeks);
  const monday = dates[0];
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function statusColor(status: BookingStatus) {
  switch (status) {
    case "PAID":
      return "bg-primary/20 border-primary/40 text-primary hover:bg-primary/30";
    case "PENDING":
      return "bg-warning/15 border-warning/40 text-warning hover:bg-warning/25";
    case "CANCELLED":
      return "bg-destructive/10 border-destructive/30 text-destructive/70 line-through hover:bg-destructive/15";
  }
}

function statusLabel(status: BookingStatus) {
  switch (status) {
    case "PAID": return "Confirmada";
    case "PENDING": return "Pendiente";
    case "CANCELLED": return "Cancelada";
  }
}

type TimeGridProps = {
  ownerId: string;
  initialBookings: GridBooking[];
  onSelectBooking?: (booking: GridBooking) => void;
};

export function TimeGrid({ ownerId, initialBookings, onSelectBooking }: TimeGridProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookings, setBookings] = useState<GridBooking[]>(initialBookings);
  const [selected, setSelected] = useState<GridBooking | null>(null);
  const [loading, startTransition] = useTransition();

  useEffect(() => {
    if (weekOffset === 0) {
      // Sincronizar con props al volver a la semana actual
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset explícito a datos del servidor
      setBookings(initialBookings);
      return;
    }
    startTransition(async () => {
      const mondayISO = getMondayISO(weekOffset);
      const data = await fetchWeekBookings(ownerId, mondayISO);
      setBookings(data);
    });
  }, [weekOffset, ownerId, initialBookings]);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const todayIndex = useMemo(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA");
    return weekDates.findIndex(
      (d) => d.toLocaleDateString("en-CA") === todayStr,
    );
  }, [weekDates]);

  function handleClick(b: GridBooking) {
    setSelected(b);
    onSelectBooking?.(b);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setWeekOffset(0)}
            className={cn(weekOffset === 0 && "border-primary text-primary")}
          >
            Hoy
          </Button>
          {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {weekDates[0].toLocaleDateString("es-CO", { month: "short", day: "numeric" })}
          {" – "}
          {weekDates[6].toLocaleDateString("es-CO", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-muted/50">
            <div className="px-2 py-2" />
            {weekDates.map((d, i) => (
              <div
                key={i}
                className={cn(
                  "px-2 py-2 text-center text-xs font-medium",
                  i === todayIndex && "bg-primary/10 text-primary font-bold",
                )}
              >
                <div className="uppercase">{DAY_SHORT[i]}</div>
                <div className={cn("text-lg", i === todayIndex ? "font-bold" : "font-semibold text-foreground")}>
                  {d.getDate()}
                </div>
              </div>
            ))}
          </div>

          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border last:border-0"
            >
              <div className="flex items-start justify-end px-2 py-1 text-[11px] text-muted-foreground">
                {formatHour(hour)}
              </div>
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const booking = bookings.find(
                  (b) =>
                    b.day === dayIndex &&
                    hour >= b.startHour &&
                    hour < b.endHour,
                );

                const isStart = booking?.startHour === hour;
                const spanHours = booking ? booking.endHour - booking.startHour : 0;

                if (booking && !isStart) {
                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "border-l border-border",
                        dayIndex === todayIndex && "bg-primary/[0.03]",
                      )}
                    />
                  );
                }

                if (booking && isStart) {
                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "relative border-l border-border p-0.5",
                        dayIndex === todayIndex && "bg-primary/[0.03]",
                      )}
                    >
                      <button
                        onClick={() => handleClick(booking)}
                        className={cn(
                          "absolute inset-x-0.5 top-0.5 z-10 flex flex-col items-start gap-0.5 rounded-md border px-1.5 py-1 text-left text-[10px] leading-tight transition-colors cursor-pointer",
                          statusColor(booking.status),
                          selected?.id === booking.id && "ring-2 ring-ring",
                        )}
                        style={{ height: `calc(${spanHours * 100}% - 4px)` }}
                      >
                        <span className="font-semibold line-clamp-1">
                          {booking.field_name}
                        </span>
                        <span className="opacity-70 line-clamp-1">
                          {booking.user_name}
                        </span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "border-l border-border",
                      dayIndex === todayIndex && "bg-primary/[0.03]",
                    )}
                    style={{ minHeight: "2.25rem" }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="font-semibold">{selected.field_name}</h4>
              <p className="text-sm text-muted-foreground">
                {DAY_LABELS[selected.day]} · {formatHour(selected.startHour)} – {formatHour(selected.endHour)}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Cliente:</span>{" "}
                {selected.user_name} ({selected.user_email})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  selected.status === "PAID"
                    ? "default"
                    : selected.status === "PENDING"
                      ? "secondary"
                      : "destructive"
                }
              >
                {statusLabel(selected.status)}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
