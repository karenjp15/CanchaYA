"use client";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Field } from "@/lib/data/fields";
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
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
        Detalles
      </h3>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Fecha</dt>
          <dd className="font-medium capitalize">
            {selectedDate ? formatDateLong(selectedDate) : "—"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Hora</dt>
          <dd className="font-medium">
            {selectedTime ? parseTimeLabel(selectedTime) : "—"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Cancha</dt>
          <dd className="font-medium">{field.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Jugadores</dt>
          <dd className="font-medium">
            {FIELD_TYPE_LABELS[field.field_type]} · {FIELD_TYPE_PLAYERS[field.field_type]}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <dt className="font-semibold">Costo</dt>
          <dd className="font-bold text-primary">
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

      {ready ? (
        <Link
          href={`/checkout?field=${field.id}&date=${selectedDate}&time=${encodeURIComponent(selectedTime!)}`}
          className={cn(buttonVariants(), "w-full")}
        >
          Reservar
        </Link>
      ) : (
        <div className="rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
          Selecciona fecha y hora para continuar
        </div>
      )}
    </div>
  );
}
