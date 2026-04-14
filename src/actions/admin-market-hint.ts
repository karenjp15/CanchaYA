"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/profile";
import { inferExplorarCitySlugFromAddress } from "@/lib/colombia-cities";
import type { Database } from "@/types/database.types";

export type MarketHourlyPriceHint = {
  sample_count: number;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  suggested: number | null;
  low_confidence: boolean;
};

type Sport = Database["public"]["Enums"]["sport_type"];
type FootballCap = Database["public"]["Enums"]["football_capacity"];
type FootballSurf = Database["public"]["Enums"]["football_surface"];
type PadelWall = Database["public"]["Enums"]["padel_wall_material"];
type PadelLoc = Database["public"]["Enums"]["padel_court_location"];

export async function fetchMarketHourlyPriceHint(input: {
  venueAddress: string | null | undefined;
  sport: Sport;
  footballCapacity: FootballCap | null;
  footballSurface: FootballSurf | null;
  padelWall: PadelWall | null;
  padelLocation: PadelLoc | null;
  slotDurationMinutes: number;
  excludeFieldId?: string | null;
}): Promise<MarketHourlyPriceHint | null> {
  const profile = await getProfile();
  if (!profile || profile.role !== "ADMIN") return null;

  const slug = inferExplorarCitySlugFromAddress(input.venueAddress) ?? "";

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("market_hourly_price_hint", {
    p_sport: input.sport,
    p_city_slug: slug,
    p_football_capacity: input.footballCapacity,
    p_football_surface: input.footballSurface,
    p_padel_wall: input.padelWall,
    p_padel_location: input.padelLocation,
    p_slot_duration_minutes: input.slotDurationMinutes,
    p_exclude_field_id: input.excludeFieldId ?? null,
  });

  if (error || data == null || typeof data !== "object") return null;

  const o = data as Record<string, unknown>;
  return {
    sample_count: Number(o.sample_count ?? 0),
    p25: o.p25 != null ? Number(o.p25) : null,
    p50: o.p50 != null ? Number(o.p50) : null,
    p75: o.p75 != null ? Number(o.p75) : null,
    suggested: o.suggested != null ? Number(o.suggested) : null,
    low_confidence: Boolean(o.low_confidence),
  };
}
