"use server";

import { createClient } from "@/lib/supabase/server";
import { fieldFormSchema } from "@/lib/schemas/field";
import { revalidatePath } from "next/cache";

export type FieldActionState = {
  error?: string;
  message?: string;
};

export async function createField(
  _prev: FieldActionState,
  formData: FormData,
): Promise<FieldActionState> {
  const parsed = fieldFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    fieldType: formData.get("fieldType"),
    surface: formData.get("surface"),
    hourlyPrice: formData.get("hourlyPrice"),
    address: formData.get("address"),
    parkingAvailable: formData.get("parkingAvailable") === "true",
    sellsLiquor: formData.get("sellsLiquor") === "true",
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

  const { error } = await supabase.from("fields").insert({
    owner_id: user.id,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    field_type: parsed.data.fieldType,
    surface: parsed.data.surface,
    hourly_price: parsed.data.hourlyPrice.toFixed(2),
    address: parsed.data.address,
    parking_available: parsed.data.parkingAvailable,
    sells_liquor: parsed.data.sellsLiquor,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/canchas");
  return { message: "Cancha creada exitosamente" };
}

export async function updateField(
  _prev: FieldActionState,
  formData: FormData,
): Promise<FieldActionState> {
  const fieldId = formData.get("fieldId") as string;
  if (!fieldId) return { error: "ID de cancha requerido" };

  const parsed = fieldFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    fieldType: formData.get("fieldType"),
    surface: formData.get("surface"),
    hourlyPrice: formData.get("hourlyPrice"),
    address: formData.get("address"),
    parkingAvailable: formData.get("parkingAvailable") === "true",
    sellsLiquor: formData.get("sellsLiquor") === "true",
  });

  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Revisa los campos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("fields")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      field_type: parsed.data.fieldType,
      surface: parsed.data.surface,
      hourly_price: parsed.data.hourlyPrice.toFixed(2),
      address: parsed.data.address,
      parking_available: parsed.data.parkingAvailable,
      sells_liquor: parsed.data.sellsLiquor,
    })
    .eq("id", fieldId);

  if (error) return { error: error.message };

  revalidatePath("/admin/canchas");
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
