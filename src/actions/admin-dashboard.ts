"use server";

import { getWeekGridBookings, type GridBooking } from "@/lib/data/admin";

export async function fetchWeekBookings(
  ownerId: string,
  weekStartISO: string,
  venueId?: string | null,
): Promise<GridBooking[]> {
  return getWeekGridBookings(ownerId, weekStartISO, venueId);
}
