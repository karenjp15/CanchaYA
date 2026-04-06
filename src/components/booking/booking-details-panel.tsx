"use client";

import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Field } from "@/lib/data/field-model";
import { FIELD_TYPE_LABELS, FIELD_TYPE_PLAYERS } from "@/lib/constants";
import { formatDateLong } from "@/lib/date-utils";

type BookingDetailsPanelProps = {
  field: Field;
  selectedDate: string | null;
  selectedTime: string | null;
};

function parseTimeLabel(iso: string) {
  const h = parseInt(iso.split("T")[1].split(":")[0], 10);
  const end = h + 2;
  const fmt = (n: number) => {
    const h12 = n > 12 ? n - 12 : n === 0 ? 12 : n;
    return `${h12} ${n >= 12 ? "pm" : "am"}`;
  };
  return `${fmt(h)} – ${fmt(end)}`;
}

export function BookingDetailsPanel({
  field,
  selectedDate,
  selectedTime,
}: BookingDetailsPanelProps) {
  const ready = selectedDate && selectedTime;
  const cost = Number(field.hourly_price) * 2;

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
            {selectedTime ? parseTimeLabel(selectedTime) : "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <dt className="shrink-0 text-muted-foreground">Cancha</dt>
          <dd className="min-w-0 break-words font-medium sm:text-right">
            {field.name}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <dt className="shrink-0 text-muted-foreground">Jugadores</dt>
          <dd className="min-w-0 font-medium sm:text-right">
            {FIELD_TYPE_LABELS[field.field_type]} ·{" "}
            {FIELD_TYPE_PLAYERS[field.field_type]}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 border-t border-border pt-2 sm:flex-row sm:items-center sm:justify-between">
          <dt className="font-semibold">Costo</dt>
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
            href={`/checkout?field=${field.id}&date=${selectedDate}&time=${encodeURIComponent(selectedTime!)}`}
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
