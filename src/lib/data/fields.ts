import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type Field = Database["public"]["Tables"]["fields"]["Row"];

export async function getActiveFields(filters?: {
  type?: string;
  parking?: string;
  liquor?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("fields")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (filters?.type && ["F5", "F6", "F7", "F8", "F11"].includes(filters.type)) {
    query = query.eq(
      "field_type",
      filters.type as Database["public"]["Enums"]["field_type"],
    );
  }
  if (filters?.parking === "1") query = query.eq("parking_available", true);
  if (filters?.parking === "0") query = query.eq("parking_available", false);
  if (filters?.liquor === "1") query = query.eq("sells_liquor", true);
  if (filters?.liquor === "0") query = query.eq("sells_liquor", false);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getAllFieldsByOwner(ownerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fields")
    .select("*")
    .eq("owner_id", ownerId)
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function getFieldById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fields")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
