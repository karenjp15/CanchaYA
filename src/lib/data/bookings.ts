import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export type BookingWithField = BookingRow & {
  field_name: string;
};

export async function getBookingsByUser(userId: string): Promise<{
  upcoming: BookingWithField[];
  history: BookingWithField[];
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*, fields!inner(name)")
    .eq("user_id", userId)
    .order("start_time", { ascending: false });

  if (error) throw new Error(error.message);

  const now = new Date();

  const all: BookingWithField[] = (data ?? []).map((b) => ({
    ...b,
    fields: undefined,
    field_name: (b.fields as unknown as { name: string }).name,
  })) as BookingWithField[];

  const upcoming = all.filter(
    (b) => new Date(b.start_time) >= now && b.status !== "CANCELLED",
  );
  const history = all.filter(
    (b) => new Date(b.start_time) < now || b.status === "CANCELLED",
  );

  return { upcoming, history };
}
