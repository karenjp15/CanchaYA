"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Returns the start hours (0-23) that are already booked (PENDING or PAID)
 * for a given field on a given date (YYYY-MM-DD) in America/Bogota.
 */
export async function getBookedSlots(
  fieldId: string,
  date: string,
): Promise<number[]> {
  const supabase = await createClient();

  const dayStart = `${date}T00:00:00-05:00`;
  const dayEnd = `${date}T23:59:59-05:00`;

  const { data, error } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("field_id", fieldId)
    .in("status", ["PENDING", "PAID"])
    .gte("start_time", dayStart)
    .lte("start_time", dayEnd);

  if (error || !data) return [];

  const bookedHours: number[] = [];
  for (const booking of data) {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    const startHour = parseInt(
      start.toLocaleString("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: "America/Bogota",
      }),
      10,
    );
    const endHour = parseInt(
      end.toLocaleString("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: "America/Bogota",
      }),
      10,
    );
    for (let h = startHour; h < endHour; h++) {
      if (!bookedHours.includes(h)) bookedHours.push(h);
    }
  }

  return bookedHours;
}
