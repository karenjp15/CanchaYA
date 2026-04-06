"use client";

import { useState, useMemo } from "react";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Filter } from "lucide-react";
import type { BookingWithField } from "@/lib/data/bookings";
import { APP_TIMEZONE } from "@/lib/constants";

type SortKey = "date" | "price" | "status";

function SortHeaderButton({
  k,
  label,
  onToggle,
}: {
  k: SortKey;
  label: string;
  onToggle: (key: SortKey) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="xs"
      className="gap-1 text-xs"
      onClick={() => onToggle(k)}
    >
      {label}
      <ArrowUpDown className="size-3" />
    </Button>
  );
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: APP_TIMEZONE,
  });
}

export function BookingsTable({ bookings }: { bookings: BookingWithField[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [asc, setAsc] = useState(false);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAsc((a) => !a);
    } else {
      setSortKey(key);
      setAsc(true);
    }
  }

  const sorted = useMemo(() => {
    const copy = [...bookings];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date":
          cmp = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
          break;
        case "price":
          cmp = Number(a.total_price) - Number(b.total_price);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return asc ? cmp : -cmp;
    });
    return copy;
  }, [bookings, sortKey, asc]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SortHeaderButton k="date" label="Fecha" onToggle={toggleSort} />
        <SortHeaderButton k="price" label="Precio" onToggle={toggleSort} />
        <SortHeaderButton k="status" label="Estado" onToggle={toggleSort} />
        <span className="ml-auto">
          <Button variant="outline" size="xs" className="gap-1">
            <Filter className="size-3" /> Filtrar
          </Button>
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Cancha</th>
              <th className="px-4 py-2 font-medium">Fecha / Hora</th>
              <th className="px-4 py-2 font-medium text-right">Precio</th>
              <th className="px-4 py-2 font-medium text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b, i) => (
              <tr
                key={b.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {i + 1}
                </td>
                <td className="px-4 py-3 font-medium">
                  {b.venue_name
                    ? `${b.venue_name} · ${b.field_name}`
                    : b.field_name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(b.start_time)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCOP(Number(b.total_price))}
                </td>
                <td className="px-4 py-3 text-center">
                  <BookingStatusBadge status={b.status} />
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No tienes reservas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
