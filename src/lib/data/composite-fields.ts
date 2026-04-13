import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * IDs de canchas cuyas reservas activas bloquean disponibilidad para `fieldId`
 * (misma cancha, padres combinados o miembros si `fieldId` es combinado).
 */
export async function getBookingOverlapFieldIds(
  supabase: SupabaseClient<Database>,
  fieldId: string,
): Promise<string[]> {
  const ids = new Set<string>([fieldId]);

  const { data: asMember } = await supabase
    .from("field_composite_members")
    .select("composite_field_id")
    .eq("member_field_id", fieldId);

  for (const row of asMember ?? []) {
    if (row.composite_field_id) ids.add(row.composite_field_id);
  }

  const { data: members } = await supabase
    .from("field_composite_members")
    .select("member_field_id")
    .eq("composite_field_id", fieldId);

  for (const row of members ?? []) {
    if (row.member_field_id) ids.add(row.member_field_id);
  }

  return [...ids];
}
