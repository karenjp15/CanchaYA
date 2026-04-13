import { createClient } from "@/lib/supabase/server";
import { generateTimeSlots, nextBogotaDateString, toBogotaDateString } from "@/lib/date-utils";
import type { Field } from "@/lib/data/field-model";

export type FieldWithAvailability = Field & {
  hasAvailabilityToday: boolean;
};

/**
 * Indica si la cancha tiene al menos un slot libre hoy (Bogotá), según duración estándar y reservas actuales.
 */
export async function attachAvailabilityToday(
  fields: Field[],
): Promise<FieldWithAvailability[]> {
  if (fields.length === 0) return [];

  const supabase = await createClient();
  const today = toBogotaDateString(new Date());
  const dayStart = `${today}T00:00:00-05:00`;
  const rangeEnd = `${nextBogotaDateString(today)}T00:00:00-05:00`;

  const ids = fields.map((f) => f.id);
  const { data: rows } = await supabase
    .from("bookings")
    .select("field_id, start_time, end_time")
    .in("field_id", ids)
    .in("status", ["PENDING", "PAID"])
    .gt("end_time", dayStart)
    .lt("start_time", rangeEnd);

  const byField = new Map<string, { start: string; end: string }[]>();
  for (const r of rows ?? []) {
    const list = byField.get(r.field_id) ?? [];
    list.push({ start: r.start_time, end: r.end_time });
    byField.set(r.field_id, list);
  }

  return fields.map((f) => {
    const booked = byField.get(f.id) ?? [];
    const slots = generateTimeSlots(
      today,
      booked,
      f.slot_duration_minutes,
    );
    return {
      ...f,
      hasAvailabilityToday: slots.some((s) => s.available),
    };
  });
}
