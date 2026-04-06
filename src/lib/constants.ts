import type { FieldType } from "@/types/database.types";

/** Zona horaria única del producto (reservas, slots, UI). */
export const APP_TIMEZONE = "America/Bogota" as const;

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  F5: "Fútbol 5",
  F6: "Fútbol 6",
  F7: "Fútbol 7",
  F8: "Fútbol 8",
  F11: "Fútbol 11",
};

export const FIELD_TYPE_PLAYERS: Record<FieldType, string> = {
  F5: "10",
  F6: "12",
  F7: "14",
  F8: "16",
  F11: "22",
};
