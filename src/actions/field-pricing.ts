"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveHourlyPriceFromWindows } from "@/lib/field-pricing";
import { fetchPricingWindowsForFields } from "@/lib/data/field-pricing-data";

/** Tarifa horaria efectiva para un inicio de reserva (Bogotá + ventanas). */
export async function getResolvedHourlyPrice(
  fieldId: string,
  startIso: string,
): Promise<number> {
  const supabase = await createClient();
  const { data: field, error: fe } = await supabase
    .from("fields")
    .select("hourly_price")
    .eq("id", fieldId)
    .maybeSingle();

  if (fe || !field) return 0;

  const fallback = Number(field.hourly_price);
  const winMap = await fetchPricingWindowsForFields(supabase, [fieldId]);
  const windows = winMap.get(fieldId) ?? [];

  return resolveHourlyPriceFromWindows(windows, startIso, fallback);
}
