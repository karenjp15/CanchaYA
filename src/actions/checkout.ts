"use server";

import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/schemas/checkout";
import { redirect } from "next/navigation";

export type CheckoutActionState = {
  error?: string;
  success?: boolean;
};

export async function processCheckout(
  _prev: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const parsed = checkoutSchema.safeParse({
    fieldId: formData.get("fieldId"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    address: formData.get("address"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    idDocumentType: formData.get("idDocumentType"),
    idNumber: formData.get("idNumber"),
    paymentMethod: formData.get("paymentMethod"),
  });

  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Revisa los campos del formulario" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Debes iniciar sesión para reservar" };

  const { data: field, error: fieldErr } = await supabase
    .from("fields")
    .select("hourly_price")
    .eq("id", parsed.data.fieldId)
    .maybeSingle();

  if (fieldErr || !field) {
    return { error: "Cancha no encontrada" };
  }

  const start = new Date(parsed.data.startTime);
  const end = new Date(parsed.data.endTime);
  const hours = (end.getTime() - start.getTime()) / 3_600_000;
  const totalPrice = Number(field.hourly_price) * hours;

  const { error: bookingErr } = await supabase.from("bookings").insert({
    user_id: user.id,
    field_id: parsed.data.fieldId,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    total_price: totalPrice.toFixed(2),
    status: "PENDING",
    payment_method: parsed.data.paymentMethod,
    billing_first_name: parsed.data.firstName,
    billing_last_name: parsed.data.lastName,
    billing_address: parsed.data.address,
    billing_email: parsed.data.email,
    billing_phone: parsed.data.phone,
    id_document_type: parsed.data.idDocumentType,
    id_number: parsed.data.idNumber,
  });

  if (bookingErr) {
    if (bookingErr.message.includes("bookings_field_no_overlap")) {
      return { error: "Este horario ya fue reservado por otro jugador" };
    }
    return { error: bookingErr.message };
  }

  redirect("/user/reservas?status=pending");
}
