import type { Database } from "@/types/database.types";
import type { PricingWindowRow } from "@/lib/field-pricing";

export type FieldRow = Database["public"]["Tables"]["fields"]["Row"];
type VenueRow = Database["public"]["Tables"]["venues"]["Row"];

/** Cancha con datos del establecimiento (venue) incluidos vía join. */
export type Field = FieldRow & {
  venues: VenueRow;
  /** Franjas de precio (opcional; se hidrata en listados y detalle). */
  pricing_windows?: PricingWindowRow[];
};

/** Nombre comercial del establecimiento (venue). */
export function fieldVenueName(f: Field): string {
  return (f.venues?.name ?? "").trim();
}

/** Una sola línea para checkout y resúmenes: "Establecimiento · Cancha". */
export function fieldBookingSummaryLine(f: Field): string {
  const v = fieldVenueName(f);
  const court = (f.name ?? "").trim();
  if (v && court) return `${v} · ${court}`;
  return v || court || "—";
}

export function fieldAddress(f: Field): string {
  return f.venues?.address ?? "";
}

export function fieldLatitude(f: Field): number | null {
  return f.venues?.latitude ?? null;
}

export function fieldLongitude(f: Field): number | null {
  return f.venues?.longitude ?? null;
}
