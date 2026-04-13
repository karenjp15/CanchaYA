"use server";

import { createClient } from "@/lib/supabase/server";
import { replacePricingWindowsSingleBand } from "@/lib/data/field-pricing-data";
import { fieldCreateSchema, fieldUpdateSchema } from "@/lib/schemas/field";
import type { Database } from "@/types/database.types";
import { revalidatePath } from "next/cache";

type FieldInsert = Database["public"]["Tables"]["fields"]["Insert"];

export type FieldActionState = {
  error?: string;
  message?: string;
};

async function uploadFieldImage(
  fieldId: string,
  file: File,
): Promise<string | null> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${fieldId}.${ext}`;

  const { error } = await supabase.storage
    .from("field-images")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return null;

  const {
    data: { publicUrl },
  } = supabase.storage.from("field-images").getPublicUrl(path);

  return publicUrl;
}

function buildFieldPayload(
  parsed: {
    name: string;
    description?: string;
    hourlyPrice: number;
    sport: "PADEL" | "FUTBOL";
    slotDurationMinutes: number;
    footballCapacity?: "F5" | "F7" | "F9" | "F11";
    footballSurface?: "SYNTHETIC_GRASS" | "NATURAL_GRASS";
    padelWall?: "GLASS" | "WALL";
    padelLocation?: "INDOOR" | "OUTDOOR";
  },
): Omit<FieldInsert, "owner_id" | "venue_id" | "id"> {
  if (parsed.sport === "FUTBOL") {
    return {
      name: parsed.name,
      description: parsed.description ?? null,
      hourly_price: parsed.hourlyPrice.toFixed(2),
      sport: parsed.sport,
      slot_duration_minutes: parsed.slotDurationMinutes,
      football_capacity: parsed.footballCapacity ?? null,
      football_surface: parsed.footballSurface ?? null,
      padel_wall_material: null,
      padel_location: null,
    };
  }
  return {
    name: parsed.name,
    description: parsed.description ?? null,
    hourly_price: parsed.hourlyPrice.toFixed(2),
    sport: parsed.sport,
    slot_duration_minutes: parsed.slotDurationMinutes,
    football_capacity: null,
    football_surface: null,
    padel_wall_material: parsed.padelWall ?? null,
    padel_location: parsed.padelLocation ?? null,
  };
}

export async function createField(
  _prev: FieldActionState,
  formData: FormData,
): Promise<FieldActionState> {
  const parsed = fieldCreateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    hourlyPrice: formData.get("hourlyPrice"),
    venueId: formData.get("venueId"),
    sport: formData.get("sport"),
    slotDurationMinutes: formData.get("slotDurationMinutes"),
    footballCapacity: formData.get("footballCapacity") || undefined,
    footballSurface: formData.get("footballSurface") || undefined,
    padelWall: formData.get("padelWall") || undefined,
    padelLocation: formData.get("padelLocation") || undefined,
  });

  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message
      ?? Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Revisa los campos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: venue, error: vErr } = await supabase
    .from("venues")
    .select("id, owner_id")
    .eq("id", parsed.data.venueId)
    .single();

  if (vErr || !venue || venue.owner_id !== user.id) {
    return { error: "Establecimiento no válido o no te pertenece" };
  }

  const insertPayload: FieldInsert = {
    owner_id: user.id,
    venue_id: parsed.data.venueId,
    ...buildFieldPayload(parsed.data),
  };

  const { data: inserted, error } = await supabase
    .from("fields")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Error al crear" };

  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const imageUrl = await uploadFieldImage(inserted.id, imageFile);
    if (imageUrl) {
      await supabase
        .from("fields")
        .update({ image_url: imageUrl })
        .eq("id", inserted.id);
    }
  }

  try {
    await replacePricingWindowsSingleBand(
      supabase,
      inserted.id,
      parsed.data.hourlyPrice,
    );
  } catch {
    /* sin tabla field_pricing_windows */
  }

  revalidatePath("/admin/canchas");
  revalidatePath("/explorar");
  return { message: "Cancha creada exitosamente" };
}

export async function updateField(
  _prev: FieldActionState,
  formData: FormData,
): Promise<FieldActionState> {
  const fieldId = formData.get("fieldId") as string;
  if (!fieldId) return { error: "ID de cancha requerido" };

  const parsed = fieldUpdateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    hourlyPrice: formData.get("hourlyPrice"),
    sport: formData.get("sport"),
    slotDurationMinutes: formData.get("slotDurationMinutes"),
    footballCapacity: formData.get("footballCapacity") || undefined,
    footballSurface: formData.get("footballSurface") || undefined,
    padelWall: formData.get("padelWall") || undefined,
    padelLocation: formData.get("padelLocation") || undefined,
  });

  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message
      ?? Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Revisa los campos" };
  }

  const supabase = await createClient();

  const updateData: Database["public"]["Tables"]["fields"]["Update"] = {
    ...buildFieldPayload(parsed.data),
  };

  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const imageUrl = await uploadFieldImage(fieldId, imageFile);
    if (imageUrl) {
      updateData.image_url = imageUrl;
    }
  }

  const { error } = await supabase
    .from("fields")
    .update(updateData)
    .eq("id", fieldId);

  if (error) return { error: error.message };

  try {
    const { count, error: cErr } = await supabase
      .from("field_pricing_windows")
      .select("id", { count: "exact", head: true })
      .eq("field_id", fieldId);
    if (!cErr && (count ?? 0) <= 1) {
      await replacePricingWindowsSingleBand(
        supabase,
        fieldId,
        parsed.data.hourlyPrice,
      );
    }
  } catch {
    /* sin migración de ventanas */
  }

  revalidatePath("/admin/canchas");
  revalidatePath("/explorar");
  return { message: "Cancha actualizada" };
}

export async function toggleFieldActive(
  fieldId: string,
  isActive: boolean,
): Promise<FieldActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fields")
    .update({ is_active: isActive })
    .eq("id", fieldId);

  if (error) return { error: error.message };

  revalidatePath("/admin/canchas");
  return { message: isActive ? "Cancha activada" : "Cancha desactivada" };
}

export async function updateBookingStatus(
  bookingId: string,
  status: "PAID" | "CANCELLED",
): Promise<FieldActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  revalidatePath("/admin/dashboard");
  return { message: `Reserva marcada como ${status === "PAID" ? "pagada" : "cancelada"}` };
}
