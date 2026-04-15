"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveHourlyPriceFromWindows } from "@/lib/field-pricing";
import { fetchPricingWindowsForFields } from "@/lib/data/field-pricing-data";
import { fetchActiveFieldOffersForDate } from "@/lib/data/field-offers";
import { toBogotaDateString } from "@/lib/date-utils";
import {
  bogotaHHmmFromIso,
  calculateEffectivePrice,
} from "@/lib/utils/pricing";

export async function getResolvedHourlyPriceBreakdown(
  fieldId: string,
  startIso: string,
): Promise<{ baseHourly: number; effectiveHourly: number }> {
  const supabase = await createClient();
  const { data: field, error: fe } = await supabase
    .from("fields")
    .select("hourly_price")
    .eq("id", fieldId)
    .maybeSingle();

  if (fe || !field) return { baseHourly: 0, effectiveHourly: 0 };

  const fallback = Number(field.hourly_price);
  const winMap = await fetchPricingWindowsForFields(supabase, [fieldId]);
  const windows = winMap.get(fieldId) ?? [];
  const baseHourly = resolveHourlyPriceFromWindows(
    windows,
    startIso,
    fallback,
  );

  const dateYmd = toBogotaDateString(new Date(startIso));
  const offers = await fetchActiveFieldOffersForDate(
    supabase,
    fieldId,
    dateYmd,
  );
  const time = bogotaHHmmFromIso(startIso);
  const effectiveHourly = calculateEffectivePrice(
    baseHourly,
    fieldId,
    dateYmd,
    time,
    offers,
  );

  return { baseHourly, effectiveHourly };
}

/** Tarifa horaria efectiva para un inicio de reserva (Bogotá + ventanas + oferta relámpago). */
export async function getResolvedHourlyPrice(
  fieldId: string,
  startIso: string,
): Promise<number> {
  const { effectiveHourly } = await getResolvedHourlyPriceBreakdown(
    fieldId,
    startIso,
  );
  return effectiveHourly;
}
