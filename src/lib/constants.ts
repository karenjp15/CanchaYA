import type {
  FootballCapacity,
  PadelCourtLocation,
  PadelWallMaterial,
  SportType,
} from "@/types/database.types";

/** Zona horaria única del producto (reservas, slots, UI). */
export const APP_TIMEZONE = "America/Bogota" as const;

export const SPORT_LABELS: Record<SportType, string> = {
  PADEL: "Pádel",
  FUTBOL: "Fútbol",
};

/** Hora local (America/Bogota): primera reserva del día. */
export const BOOKING_SLOT_DAY_START_HOUR = 6;
/** Hora local: cierre (último slot termina a esta hora, ej. 23 = hasta 11:00 p.m.). */
export const BOOKING_SLOT_DAY_END_HOUR = 23;

export const FOOTBALL_CAPACITY_LABELS: Record<FootballCapacity, string> = {
  F5: "Fútbol 5",
  F7: "Fútbol 7",
  F9: "Fútbol 9 (full)",
  F11: "Fútbol 11",
};

export const FOOTBALL_CAPACITY_PLAYERS: Record<FootballCapacity, string> = {
  F5: "10",
  F7: "14",
  F9: "18",
  F11: "22",
};

export const FOOTBALL_SURFACE_LABELS: Record<
  "SYNTHETIC_GRASS" | "NATURAL_GRASS",
  string
> = {
  SYNTHETIC_GRASS: "Grama sintética",
  NATURAL_GRASS: "Grama natural",
};

export const PADEL_WALL_LABELS: Record<PadelWallMaterial, string> = {
  GLASS: "Cristal",
  WALL: "Muro",
};

export const PADEL_LOCATION_LABELS: Record<PadelCourtLocation, string> = {
  INDOOR: "Indoor",
  OUTDOOR: "Outdoor",
};
