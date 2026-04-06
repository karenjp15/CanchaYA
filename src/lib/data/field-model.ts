import type { Database } from "@/types/database.types";

export type FieldRow = Database["public"]["Tables"]["fields"]["Row"];
type VenueRow = Database["public"]["Tables"]["venues"]["Row"];

/** Cancha con datos del establecimiento (venue) incluidos vía join. */
export type Field = FieldRow & { venues: VenueRow };

export function fieldAddress(f: Field): string {
  return f.venues?.address ?? "";
}

export function fieldLatitude(f: Field): number | null {
  return f.venues?.latitude ?? null;
}

export function fieldLongitude(f: Field): number | null {
  return f.venues?.longitude ?? null;
}
