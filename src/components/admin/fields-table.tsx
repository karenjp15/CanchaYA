"use client";

import { Fragment } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldFormDialog } from "@/components/admin/field-form-dialog";
import {
  FOOTBALL_SURFACE_LABELS,
  SPORT_LABELS,
} from "@/lib/constants";
import { fieldSportDetailLine } from "@/lib/field-display";
import { fieldAddress, type Field } from "@/lib/data/field-model";
import type { Venue } from "@/lib/data/venues";
import { groupFieldsByVenue } from "@/lib/data/field-grouping";
import { cn } from "@/lib/utils";
import { Power } from "lucide-react";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

type FieldsTableProps = {
  fields: Field[];
  venues: Venue[];
  onToggleActive?: (id: string, active: boolean) => void;
  /** Filas de encabezado por establecimiento + canchas debajo. */
  groupByVenue?: boolean;
};

function FieldRow({
  f,
  venues,
  onToggleActive,
}: {
  f: Field;
  venues: Venue[];
  onToggleActive?: (id: string, active: boolean) => void;
}) {
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/30",
        !f.is_active && "opacity-50",
      )}
    >
      <td className="px-4 py-3">
        <div className="relative size-10 overflow-hidden rounded-md bg-muted">
          {f.image_url ? (
            <Image
              src={f.image_url}
              alt={f.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-sm text-muted-foreground">
              {f.sport === "PADEL" ? "🎾" : "⚽"}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 font-medium">{f.name}</td>
      <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">
        {f.venues.name}
      </td>
      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
        {fieldAddress(f)}
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="text-[10px]">
          {SPORT_LABELS[f.sport]}
        </Badge>
      </td>
      <td className="px-4 py-3 text-muted-foreground max-w-[220px]">
        <span className="text-foreground">{fieldSportDetailLine(f)}</span>
        {f.sport === "FUTBOL" && f.football_surface ? (
          <span className="mt-0.5 block text-[11px]">
            {FOOTBALL_SURFACE_LABELS[f.football_surface]}
          </span>
        ) : null}
      </td>
      <td className="px-4 py-3 text-right font-medium">
        <span className="block">{formatCOP(Number(f.hourly_price))}</span>
        <span className="text-[10px] font-normal text-muted-foreground">
          {f.slot_duration_minutes} min
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {f.venues.parking_available ? (
          <span className="text-primary">✓</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {f.venues.sells_liquor ? (
          <span className="text-primary">✓</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <Badge
          variant={f.is_active ? "default" : "secondary"}
          className="text-[10px]"
        >
          {f.is_active ? "Activa" : "Inactiva"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <FieldFormDialog mode="edit" field={f} venues={venues} />
          <Button
            variant="ghost"
            size="icon-sm"
            title={f.is_active ? "Desactivar" : "Activar"}
            onClick={() => onToggleActive?.(f.id, !f.is_active)}
            className={cn(
              f.is_active
                ? "text-destructive hover:text-destructive"
                : "text-primary hover:text-primary",
            )}
          >
            <Power className="size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function FieldsTable({
  fields,
  venues,
  onToggleActive,
  groupByVenue = false,
}: FieldsTableProps) {
  const grouped = groupByVenue ? groupFieldsByVenue(fields) : null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium w-14">Foto</th>
            <th className="px-4 py-2.5 font-medium">Cancha</th>
            <th className="px-4 py-2.5 font-medium">Establecimiento</th>
            <th className="px-4 py-2.5 font-medium">Dirección</th>
            <th className="px-4 py-2.5 font-medium">Deporte</th>
            <th className="px-4 py-2.5 font-medium">Detalle</th>
            <th className="px-4 py-2.5 font-medium text-right">Precio / slot</th>
            <th className="px-4 py-2.5 font-medium text-center">Parking</th>
            <th className="px-4 py-2.5 font-medium text-center">Licor</th>
            <th className="px-4 py-2.5 font-medium text-center">Estado</th>
            <th className="px-4 py-2.5 font-medium text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {grouped
            ? grouped.map(({ venueId, venue, fields: groupFields }) => (
                <Fragment key={venueId}>
                  <tr className="border-b border-border bg-muted/70">
                    <td
                      colSpan={11}
                      className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-foreground"
                    >
                      {venue.name}
                      {venue.address ? (
                        <span className="ml-2 font-normal normal-case text-muted-foreground">
                          · {venue.address}
                        </span>
                      ) : null}
                      <span className="ml-2 font-normal normal-case text-muted-foreground">
                        ({groupFields.length}{" "}
                        {groupFields.length === 1 ? "cancha" : "canchas"})
                      </span>
                    </td>
                  </tr>
                  {groupFields.map((f) => (
                    <FieldRow
                      key={f.id}
                      f={f}
                      venues={venues}
                      onToggleActive={onToggleActive}
                    />
                  ))}
                </Fragment>
              ))
            : fields.map((f) => (
                <FieldRow
                  key={f.id}
                  f={f}
                  venues={venues}
                  onToggleActive={onToggleActive}
                />
              ))}
          {fields.length === 0 && (
            <tr>
              <td
                colSpan={11}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No hay canchas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
