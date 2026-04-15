import type { createClient } from "@/lib/supabase/server";
import type { FieldOfferPricingInput } from "@/lib/utils/pricing";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

function rowToPricingInput(r: {
  field_id: string;
  date: string;
  start_time: string;
  end_time: string;
  discount_percentage: string | number;
  is_active: boolean;
}): FieldOfferPricingInput {
  return {
    field_id: r.field_id,
    date: r.date,
    start_time: r.start_time,
    end_time: r.end_time,
    discount_percentage: Number(r.discount_percentage),
    is_active: r.is_active,
  };
}

export async function fetchActiveFieldOffersForDate(
  supabase: SupabaseServer,
  fieldId: string,
  dateYmd: string,
): Promise<FieldOfferPricingInput[]> {
  const { data, error } = await supabase
    .from("field_offers")
    .select(
      "field_id, date, start_time, end_time, discount_percentage, is_active",
    )
    .eq("field_id", fieldId)
    .eq("date", dateYmd)
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPricingInput);
}

/** Alguna cancha del club tiene oferta activa en esa fecha (calendario Bogotá en `dateYmd`). */
export async function venueHasActiveFlashOffersOnDate(
  supabase: SupabaseServer,
  venueId: string,
  dateYmd: string,
): Promise<boolean> {
  const { data: fields, error: fe } = await supabase
    .from("fields")
    .select("id")
    .eq("venue_id", venueId)
    .eq("is_active", true);

  if (fe) throw new Error(fe.message);
  const ids = (fields ?? []).map((f) => f.id);
  if (ids.length === 0) return false;

  const { data, error } = await supabase
    .from("field_offers")
    .select("id")
    .in("field_id", ids)
    .eq("date", dateYmd)
    .eq("is_active", true)
    .limit(1);

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

function minutesFromTimeString(t: string): number {
  const [h = 0, m = 0] = t.split(":").map((x) => Number(x));
  return h * 60 + m;
}

function rangesOverlapMinutes(
  a0: number,
  a1: number,
  b0: number,
  b1: number,
): boolean {
  return a0 < b1 && b0 < a1;
}

/** Hay oferta activa que solapa [rangeStartHour, rangeEndExclusive) en alguna de las canchas. */
export async function hasActiveFlashOfferOverlappingWindow(
  supabase: SupabaseServer,
  fieldIds: string[],
  dateYmd: string,
  rangeStartHour: number,
  rangeEndExclusive: number,
): Promise<boolean> {
  if (fieldIds.length === 0) return false;
  const newA = rangeStartHour * 60;
  const newB = rangeEndExclusive * 60;

  const { data, error } = await supabase
    .from("field_offers")
    .select("start_time, end_time")
    .in("field_id", fieldIds)
    .eq("date", dateYmd)
    .eq("is_active", true);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const o0 = minutesFromTimeString(row.start_time as string);
    const o1 = minutesFromTimeString(row.end_time as string);
    if (rangesOverlapMinutes(newA, newB, o0, o1)) return true;
  }
  return false;
}

export async function deactivateOverlappingFlashOffers(
  supabase: SupabaseServer,
  fieldIds: string[],
  dateYmd: string,
  rangeStartHour: number,
  rangeEndExclusive: number,
): Promise<void> {
  if (fieldIds.length === 0) return;
  const newA = rangeStartHour * 60;
  const newB = rangeEndExclusive * 60;

  const { data, error } = await supabase
    .from("field_offers")
    .select("id, start_time, end_time")
    .in("field_id", fieldIds)
    .eq("date", dateYmd)
    .eq("is_active", true);

  if (error) throw new Error(error.message);

  const ids =
    data
      ?.filter((row) => {
        const o0 = minutesFromTimeString(row.start_time as string);
        const o1 = minutesFromTimeString(row.end_time as string);
        return rangesOverlapMinutes(newA, newB, o0, o1);
      })
      .map((r) => r.id) ?? [];

  if (ids.length === 0) return;

  const { error: ue } = await supabase
    .from("field_offers")
    .update({ is_active: false })
    .in("id", ids);

  if (ue) throw new Error(ue.message);
}
