"use client";

import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getResolvedHourlyPrice } from "@/actions/field-pricing";
import { fieldVenueName, type Field } from "@/lib/data/field-model";
import { fieldSportDetailLine } from "@/lib/field-display";
import { formatDateLong } from "@/lib/date-utils";
import { totalPriceFromHourlyAndMinutes } from "@/lib/pricing";
import type { SportType } from "@/types/database.types";

type BookingDetailsPanelProps = {
  field: Field;
  selectedDate: string | null;
  selectedTime: string | null;
  sport: SportType;
};

function parseTimeRangeLabel(isoStart: string, durationMinutes: number) {
  const start = new Date(isoStart);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Bogota",
  };
  return `${start.toLocaleTimeString("es-CO", opts)} – ${end.toLocaleTimeString("es-CO", opts)}`;
}

export function BookingDetailsPanel({
  field,
  selectedDate,
  selectedTime,
  sport,
}: BookingDetailsPanelProps) {
  const venue = fieldVenueName(field);
  const ready = selectedDate && selectedTime;
  const durationMin = field.slot_duration_minutes;
  const [hourly, setHourly] = useState(Number(field.hourly_price));

  useEffect(() => {
    if (!selectedTime) {
      setHourly(Number(field.hourly_price));
      return;
    }
    let cancelled = false;
    void getResolvedHourlyPrice(field.id, selectedTime).then((h) => {
      if (!cancelled) {
        setHourly(h > 0 ? h : Number(field.hourly_price));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [field.id, field.hourly_price, selectedTime]);

  const cost = totalPriceFromHourlyAndMinutes(hourly, durationMin);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
        Detalles
      </h3>

      <dl className="space-y-2.5 text-sm">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <dt className="shrink-0 text-muted-foreground">Fecha</dt>
          <dd className="min-w-0 font-medium capitalize sm:text-right">
            {selectedDate ? formatDateLong(selectedDate) : "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <dt className="shrink-0 text-muted-foreground">Hora</dt>
          <dd className="min-w-0 font-medium sm:text-right">
            {selectedTime
              ? parseTimeRangeLabel(selectedTime, durationMin)
              : "—"}
          </dd>
        </div>
        {venue ? (
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <dt className="shrink-0 text-muted-foreground">Establecimiento</dt>
            <dd className="min-w-0 break-words font-medium sm:text-right">
              {venue}
            </dd>
          </div>
        ) : null}
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <dt className="shrink-0 text-muted-foreground">Cancha</dt>
          <dd className="min-w-0 break-words font-medium sm:text-right">
            {field.name}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <dt className="shrink-0 text-muted-foreground">Modalidad</dt>
          <dd className="min-w-0 font-medium sm:text-right">
            {fieldSportDetailLine(field)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 border-t border-border pt-2 sm:flex-row sm:items-center sm:justify-between">
          <dt className="font-semibold">Precio final (real)</dt>
          <dd className="font-bold text-warning sm:text-right">
            {ready
              ? new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(cost)
              : "—"}
          </dd>
        </div>
      </dl>

      <div className="space-y-2">
        {!ready ? (
          <p className="text-center text-xs text-muted-foreground">
            Selecciona fecha y hora para continuar
          </p>
        ) : null}
        {ready ? (
          <Link
            href={`/checkout?field=${field.id}&date=${selectedDate}&time=${encodeURIComponent(selectedTime!)}&sport=${sport}`}
            className={cn(buttonVariants(), "w-full justify-center")}
          >
            Reservar
          </Link>
        ) : (
          <Button type="button" disabled className="w-full">
            Reservar
          </Button>
        )}
      </div>
    </div>
  );
}
