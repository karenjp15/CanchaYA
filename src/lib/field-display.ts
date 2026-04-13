import {
  FOOTBALL_CAPACITY_LABELS,
  FOOTBALL_CAPACITY_PLAYERS,
  FOOTBALL_SURFACE_LABELS,
  PADEL_LOCATION_LABELS,
  PADEL_WALL_LABELS,
  SPORT_LABELS,
} from "@/lib/constants";
import type { Field } from "@/lib/data/field-model";

/** Badge principal: deporte + detalle (capacidad o tipo de pista). */
export function fieldSportDetailLine(field: Field): string {
  if (field.sport === "FUTBOL" && field.football_capacity) {
    return `${FOOTBALL_CAPACITY_LABELS[field.football_capacity]} · ${FOOTBALL_CAPACITY_PLAYERS[field.football_capacity]} jugadores`;
  }
  if (field.sport === "PADEL") {
    const wall = field.padel_wall_material
      ? PADEL_WALL_LABELS[field.padel_wall_material]
      : "";
    const loc = field.padel_location
      ? PADEL_LOCATION_LABELS[field.padel_location]
      : "";
    return [wall, loc].filter(Boolean).join(" · ") || SPORT_LABELS.PADEL;
  }
  return SPORT_LABELS[field.sport];
}

/** Segunda línea de atributos (superficie o ubicación de pista). */
export function fieldSurfaceOrCourtLine(field: Field): string {
  if (field.sport === "FUTBOL" && field.football_surface) {
    return FOOTBALL_SURFACE_LABELS[field.football_surface];
  }
  if (field.sport === "PADEL") {
    return fieldSportDetailLine(field);
  }
  return "";
}
