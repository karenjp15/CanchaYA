"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchActiveFieldOffersForDate } from "@/lib/data/field-offers";
import type { FieldOfferPricingInput } from "@/lib/utils/pricing";

export async function loadFlashOffersForBookingDay(
  fieldId: string,
  dateYmd: string,
): Promise<FieldOfferPricingInput[]> {
  const supabase = await createClient();
  return fetchActiveFieldOffersForDate(supabase, fieldId, dateYmd);
}
