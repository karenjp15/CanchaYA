"use server";

import { createClient } from "@/lib/supabase/server";
import { fieldCreateSchema, fieldUpdateSchema } from "@/lib/schemas/field";
import { revalidatePath } from "next/cache";

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

export async function createField(
  _prev: FieldActionState,
  formData: FormData,
): Promise<FieldActionState> {
  const parsed = fieldCreateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    fieldType: formData.get("fieldType"),
    surface: formData.get("surface"),
    hourlyPrice: formData.get("hourlyPrice"),
    venueId: formData.get("venueId"),
  });

  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
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
    return { error: "Local no válido o no te pertenece" };
  }

  const { data: inserted, error } = await supabase
    .from("fields")
    .insert({
      owner_id: user.id,
      venue_id: parsed.data.venueId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      field_type: parsed.data.fieldType,
      surface: parsed.data.surface,
      hourly_price: parsed.data.hourlyPrice.toFixed(2),
    })
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
    fieldType: formData.get("fieldType"),
    surface: formData.get("surface"),
    hourlyPrice: formData.get("hourlyPrice"),
  });

  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Revisa los campos" };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    field_type: parsed.data.fieldType,
    surface: parsed.data.surface,
    hourly_price: parsed.data.hourlyPrice.toFixed(2),
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
