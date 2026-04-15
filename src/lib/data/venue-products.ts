import type { Field } from "@/lib/data/field-model";
import {
  FOOTBALL_CAPACITY_LABELS,
  SPORT_LABELS,
} from "@/lib/constants";
import type { FootballCapacity, SportType } from "@/types/database.types";

/** Clave de producto en reserva por club: capacidad de fútbol o `PADEL`. */
export type VenueProductKey = string;

export type VenueProductOption = {
  key: VenueProductKey;
  label: string;
  candidates: Field[];
};

const CAP_ORDER: FootballCapacity[] = ["F5", "F7", "F9", "F11"];

/**
 * Opciones de reserva para un club: por capacidad (fútbol) o una entrada pádel con todas las pistas.
 */
export function buildVenueProductOptions(
  fields: Field[],
  sport: SportType,
): VenueProductOption[] {
  const list = fields.filter((f) => f.sport === sport);
  if (sport === "FUTBOL") {
    const byCap = new Map<FootballCapacity, Field[]>();
    for (const f of list) {
      if (!f.football_capacity) continue;
      const arr = byCap.get(f.football_capacity) ?? [];
      arr.push(f);
      byCap.set(f.football_capacity, arr);
    }
    return CAP_ORDER.filter((c) => byCap.has(c)).map((c) => ({
      key: c,
      label: FOOTBALL_CAPACITY_LABELS[c],
      candidates: byCap.get(c)!,
    }));
  }
  if (sport === "PADEL" && list.length > 0) {
    return [
      {
        key: "PADEL",
        label: SPORT_LABELS.PADEL,
        candidates: list,
      },
    ];
  }
  return [];
}

export function commonSlotDurationMinutes(
  candidates: Field[],
): number | null {
  if (candidates.length === 0) return null;
  const m = candidates[0]!.slot_duration_minutes;
  if (!candidates.every((c) => c.slot_duration_minutes === m)) return null;
  return m;
}
