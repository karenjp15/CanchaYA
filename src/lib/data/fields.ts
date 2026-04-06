import { createClient } from "@/lib/supabase/server";
import type { Venue } from "@/lib/data/venues";
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

export async function getActiveFields(filters?: {
  type?: string;
  parking?: string;
  liquor?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fields")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(error.message);

  const fieldRows = (data ?? []) as FieldRow[];
  const map = await loadVenueMap(
    supabase,
    fieldRows.map((f) => f.venue_id),
  );

  let rows = attachVenues(fieldRows, map);

  if (filters?.type && ["F5", "F6", "F7", "F8", "F11"].includes(filters.type)) {
    rows = rows.filter((f) => f.field_type === filters.type);
  }
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

  return rows;
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

  return attachVenues(fieldRows, map);
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
  return { ...field, venues: v };
}
