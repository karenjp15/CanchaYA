"use server";

import { createClient } from "@/lib/supabase/server";
import { getBookingOverlapFieldIds } from "@/lib/data/composite-fields";
import { nextBogotaDateString } from "@/lib/date-utils";

/**
 * Intervalos [start, end) de reservas activas que solapan el día dado (America/Bogota).
 * Incluye bloqueos por modo combinado (F9) y canchas miembro.
 */
export async function getBookedIntervalsForField(
  fieldId: string,
  date: string,
): Promise<{ start: string; end: string }[]> {
  const supabase = await createClient();

  const dayStart = `${date}T00:00:00-05:00`;
  const nextDayStr = nextBogotaDateString(date);
  const rangeEnd = `${nextDayStr}T00:00:00-05:00`;

  const overlapIds = await getBookingOverlapFieldIds(supabase, fieldId);

  const { data, error } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .in("field_id", overlapIds)
    .in("status", ["PENDING", "PAID"])
    .gt("end_time", dayStart)
    .lt("start_time", rangeEnd);

  if (error || !data) return [];

  return data.map((b) => ({ start: b.start_time, end: b.end_time }));
}
