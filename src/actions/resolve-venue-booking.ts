"use server";

import { createClient } from "@/lib/supabase/server";
import { getFieldsForVenue } from "@/lib/data/fields";
import { getBookingOverlapFieldIds } from "@/lib/data/composite-fields";
import type { FootballCapacity, SportType } from "@/types/database.types";

/**
 * Elige una cancha concreta (`field_id`) para una reserva en un club:
 * primera cancha candidata (orden por nombre) sin solapamiento con PENDING/PAID
 * en su conjunto de solape (incluye modo combinado F9).
 */
export async function resolveVenueBookingFieldId(
  venueId: string,
  sport: SportType,
  productKey: string,
  startIso: string,
): Promise<{ fieldId: string } | { error: string }> {
  const fields = await getFieldsForVenue(venueId);
  let candidates = fields.filter((f) => f.sport === sport);

  if (sport === "FUTBOL") {
    const cap = productKey as FootballCapacity;
    if (!["F5", "F7", "F9", "F11"].includes(cap)) {
      return { error: "Capacidad no válida" };
    }
    candidates = candidates.filter((f) => f.football_capacity === cap);
  } else if (sport === "PADEL") {
    if (productKey !== "PADEL") {
      return { error: "Producto no válido" };
    }
  } else {
    return { error: "Deporte no soportado" };
  }

  if (candidates.length === 0) {
    return { error: "No hay canchas para esta opción" };
  }

  const slotMin = candidates[0]!.slot_duration_minutes;
  if (!candidates.every((c) => c.slot_duration_minutes === slotMin)) {
    return {
      error:
        "Las canchas de esta opción tienen duraciones distintas; contacta al club.",
    };
  }

  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) {
    return { error: "Horario no válido" };
  }
  const endIso = new Date(
    start.getTime() + slotMin * 60_000,
  ).toISOString();

  const sorted = [...candidates].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
  );

  const supabase = await createClient();

  for (const field of sorted) {
    const overlapIds = await getBookingOverlapFieldIds(supabase, field.id);
    const { data: blocking, error } = await supabase
      .from("bookings")
      .select("id")
      .in("field_id", overlapIds)
      .in("status", ["PENDING", "PAID"])
      .lt("start_time", endIso)
      .gt("end_time", startIso)
      .limit(1);

    if (error) return { error: error.message };
    if (!blocking?.length) {
      return { fieldId: field.id };
    }
  }

  return { error: "Ese horario ya no está disponible para esta opción" };
}
