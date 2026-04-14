import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { PricingWindowRow } from "@/lib/field-pricing";
import {
  expandBandToRows,
  type SpecialBandForm,
} from "@/lib/pricing-windows-form";

export async function fetchPricingWindowsForFields(
  supabase: SupabaseClient<Database>,
  fieldIds: string[],
): Promise<Map<string, PricingWindowRow[]>> {
  const map = new Map<string, PricingWindowRow[]>();
  const unique = [...new Set(fieldIds.filter(Boolean))];
  if (unique.length === 0) return map;

  const { data, error } = await supabase
    .from("field_pricing_windows")
    .select("field_id, start_minute, end_minute, hourly_price, day_of_week")
    .in("field_id", unique)
    .order("start_minute", { ascending: true });

  if (error) throw new Error(error.message);

  for (const id of unique) map.set(id, []);
  for (const row of data ?? []) {
    const fid = row.field_id;
    const list = map.get(fid) ?? [];
    list.push({
      start_minute: row.start_minute,
      end_minute: row.end_minute,
      hourly_price: Number(row.hourly_price),
      day_of_week: row.day_of_week,
    });
    map.set(fid, list);
  }
  return map;
}

/** Precio base 24h + franjas especiales (prioridad a ventanas más estrechas al resolver). */
export async function replacePricingWindowsForField(
  supabase: SupabaseClient<Database>,
  fieldId: string,
  baseHourlyPrice: number,
  specials: SpecialBandForm[],
): Promise<void> {
  const rows: Database["public"]["Tables"]["field_pricing_windows"]["Insert"][] =
    [
      {
        field_id: fieldId,
        start_minute: 0,
        end_minute: 1440,
        hourly_price: baseHourlyPrice,
        day_of_week: null,
      },
    ];

  for (const s of specials) {
    for (const r of expandBandToRows(s)) {
      rows.push({
        field_id: fieldId,
        start_minute: r.start_minute,
        end_minute: r.end_minute,
        hourly_price: r.hourly_price,
        day_of_week: r.day_of_week,
      });
    }
  }

  const { error: delErr } = await supabase
    .from("field_pricing_windows")
    .delete()
    .eq("field_id", fieldId);
  if (delErr) throw new Error(delErr.message);

  const { error: insErr } = await supabase
    .from("field_pricing_windows")
    .insert(rows);
  if (insErr) throw new Error(insErr.message);
}

/** Reemplaza ventanas por una sola franja 24h (tras crear/editar cancha en admin). */
export async function replacePricingWindowsSingleBand(
  supabase: SupabaseClient<Database>,
  fieldId: string,
  hourlyPrice: number,
): Promise<void> {
  await supabase
    .from("field_pricing_windows")
    .delete()
    .eq("field_id", fieldId);

  const { error } = await supabase.from("field_pricing_windows").insert({
    field_id: fieldId,
    start_minute: 0,
    end_minute: 1440,
    hourly_price: hourlyPrice,
    day_of_week: null,
  });

  if (error) throw new Error(error.message);
}
