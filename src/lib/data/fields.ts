import { createClient } from "@/lib/supabase/server";
import type { Venue } from "@/lib/data/venues";
import { fetchPricingWindowsForFields } from "@/lib/data/field-pricing-data";
import { venueAddressMatchesCitySlug } from "@/lib/colombia-cities";
import type { FootballCapacity, SportType } from "@/types/database.types";
import type { Field, FieldRow } from "./field-model";

export type { Field, FieldRow } from "./field-model";
export { fieldAddress, fieldLatitude, fieldLongitude } from "./field-model";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

async function loadVenueMap(
  supabase: SupabaseServer,
  venueIds: string[],
): Promise<Map<string, Venue>> {
  const unique = [...new Set(venueIds.filter(Boolean))];
  if (unique.length === 0) return new Map();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_venues_visible_for_fields",
    { p_ids: unique },
  );

  if (!rpcError && Array.isArray(rpcData)) {
    return new Map(rpcData.map((v) => [v.id, v as Venue]));
  }

  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .in("id", unique);

  if (error) {
    const missingFn =
      rpcError?.code === "PGRST202" ||
      (rpcError?.message ?? "").toLowerCase().includes("function");
    const hint = missingFn
      ? " Aplica en Supabase la migración 20260407180000_get_venues_visible_for_fields.sql."
      : "";
    throw new Error((rpcError?.message ?? error.message) + hint);
  }

  return new Map((data ?? []).map((v) => [v.id, v as Venue]));
}

function attachVenues(rows: FieldRow[], map: Map<string, Venue>): Field[] {
  return rows
    .map((f) => {
      const v = map.get(f.venue_id);
      if (!v) return null;
      return { ...f, venues: v };
    })
    .filter((r): r is Field => r !== null);
}

async function attachPricingWindows(
  supabase: SupabaseServer,
  fields: Field[],
): Promise<Field[]> {
  if (fields.length === 0) return fields;
  const winMap = await fetchPricingWindowsForFields(
    supabase,
    fields.map((f) => f.id),
  );
  return fields.map((f) => ({
    ...f,
    pricing_windows: winMap.get(f.id) ?? [],
  }));
}

/** Recuenta canchas activas por club (incluye productos no listados en explorar). */
export async function getActiveFieldCountsByVenue(
  venueIds: string[],
  sport?: SportType,
): Promise<Map<string, number>> {
  const unique = [...new Set(venueIds.filter(Boolean))];
  if (unique.length === 0) return new Map();

  const supabase = await createClient();
  let q = supabase
    .from("fields")
    .select("venue_id")
    .eq("is_active", true)
    .in("venue_id", unique);
  if (sport) q = q.eq("sport", sport);
  const { data, error } = await q;

  if (error) throw new Error(error.message);

  const map = new Map<string, number>();
  for (const id of unique) map.set(id, 0);
  for (const row of data ?? []) {
    const vid = row.venue_id;
    map.set(vid, (map.get(vid) ?? 0) + 1);
  }
  return map;
}

export async function getActiveFields(filters?: {
  sport?: SportType;
  /** Capacidad fútbol (F5 / F7 / F11). Acepta legacy `type` en UI. */
  capacity?: FootballCapacity;
  parking?: string;
  liquor?: string;
  /** Slug de ciudad (COLOMBIA_EXPLORAR_CITIES); vacío = todas. */
  city?: string | null;
}) {
  const supabase = await createClient();
  const sport = filters?.sport ?? "FUTBOL";

  let q = supabase
    .from("fields")
    .select("*")
    .eq("is_active", true)
    .eq("sport", sport)
    .or("list_in_explore.is.null,list_in_explore.eq.true")
    .order("name");

  if (
    sport === "FUTBOL" &&
    filters?.capacity &&
    ["F5", "F7", "F9", "F11"].includes(filters.capacity)
  ) {
    q = q.eq("football_capacity", filters.capacity);
  }

  const { data, error } = await q;

  if (error) throw new Error(error.message);

  const fieldRows = (data ?? []) as FieldRow[];
  const map = await loadVenueMap(
    supabase,
    fieldRows.map((f) => f.venue_id),
  );

  let rows = attachVenues(fieldRows, map);

  if (filters?.parking === "1") {
    rows = rows.filter((f) => f.venues.parking_available);
  }
  if (filters?.parking === "0") {
    rows = rows.filter((f) => !f.venues.parking_available);
  }
  if (filters?.liquor === "1") {
    rows = rows.filter((f) => f.venues.sells_liquor);
  }
  if (filters?.liquor === "0") {
    rows = rows.filter((f) => !f.venues.sells_liquor);
  }

  if (filters?.city?.trim()) {
    rows = rows.filter((f) =>
      venueAddressMatchesCitySlug(f.venues.address, filters.city),
    );
  }

  return attachPricingWindows(supabase, rows);
}

export async function getAllFieldsByOwner(ownerId: string): Promise<Field[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fields")
    .select("*")
    .eq("owner_id", ownerId)
    .order("name");

  if (error) throw new Error(error.message);

  const fieldRows = (data ?? []) as FieldRow[];
  const map = await loadVenueMap(
    supabase,
    fieldRows.map((f) => f.venue_id),
  );

  return attachPricingWindows(supabase, attachVenues(fieldRows, map));
}

/** Todas las canchas activas de un club (incluye productos solo en ficha del club, ej. F9). */
export async function getFieldsForVenue(venueId: string): Promise<Field[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fields")
    .select("*")
    .eq("venue_id", venueId)
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(error.message);

  const fieldRows = (data ?? []) as FieldRow[];
  const map = await loadVenueMap(supabase, [venueId]);
  return attachPricingWindows(supabase, attachVenues(fieldRows, map));
}

export async function getFieldById(id: string): Promise<Field | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fields")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;

  const field = data as FieldRow;
  const map = await loadVenueMap(supabase, [field.venue_id]);
  const v = map.get(field.venue_id);
  if (!v) return null;
  const base: Field = { ...field, venues: v };
  const [withPw] = await attachPricingWindows(supabase, [base]);
  return withPw ?? base;
}
