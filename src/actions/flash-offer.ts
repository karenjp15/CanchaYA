"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/profile";
import { deactivateOverlappingFlashOffers } from "@/lib/data/field-offers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createFlashOfferSchema = z.object({
  fieldIds: z.array(z.string().uuid()).min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rangeStartHour: z.number().int().min(0).max(23),
  rangeEndExclusive: z.number().int().min(1).max(24),
  discountPercentage: z.number().min(5).max(70),
});

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export type CreateFlashOfferState = {
  error?: string;
  success?: boolean;
};

export async function createFlashOffer(
  input: z.infer<typeof createFlashOfferSchema>,
): Promise<CreateFlashOfferState> {
  const parsed = createFlashOfferSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Datos de oferta no válidos" };
  }

  const profile = await getProfile();
  if (!profile || profile.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const { fieldIds, date, rangeStartHour, rangeEndExclusive, discountPercentage } =
    parsed.data;

  if (rangeEndExclusive <= rangeStartHour) {
    return { error: "Rango horario inválido" };
  }

  const supabase = await createClient();

  const { data: fields, error: fe } = await supabase
    .from("fields")
    .select("id, owner_id")
    .in("id", fieldIds);

  if (fe) return { error: fe.message };
  const rows = fields ?? [];
  if (rows.length !== fieldIds.length) {
    return { error: "Alguna cancha no existe" };
  }
  for (const f of rows) {
    if (f.owner_id !== profile.id) {
      return { error: "No eres dueño de todas las canchas seleccionadas" };
    }
  }

  await deactivateOverlappingFlashOffers(
    supabase,
    fieldIds,
    date,
    rangeStartHour,
    rangeEndExclusive,
  );

  const start_time = `${pad2(rangeStartHour)}:00:00`;
  const end_time = `${pad2(rangeEndExclusive)}:00:00`;
  const rowsToInsert = fieldIds.map((field_id) => ({
    field_id,
    date,
    start_time,
    end_time,
    discount_percentage: discountPercentage,
    is_active: true,
  }));

  const { error: ie } = await supabase.from("field_offers").insert(rowsToInsert);
  if (ie) return { error: ie.message };

  revalidatePath("/admin/dashboard");
  return { success: true };
}
