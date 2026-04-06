import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type Venue = Database["public"]["Tables"]["venues"]["Row"];

/** Locales activos (explorar / selects públicos). */
export async function getVenuesByOwner(ownerId: string): Promise<Venue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Todos los locales del dueño (panel admin). */
export async function getAllVenuesByOwner(ownerId: string): Promise<Venue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("owner_id", ownerId)
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getVenueById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
