"use server";

import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/schemas/checkout";
import { fetchPricingWindowsForFields } from "@/lib/data/field-pricing-data";
import { resolveHourlyPriceFromWindows } from "@/lib/field-pricing";
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
    .select("hourly_price, slot_duration_minutes")
    .eq("id", parsed.data.fieldId)
    .maybeSingle();

  if (fieldErr || !field) {
    return { error: "Cancha no encontrada" };
  }

  const start = new Date(parsed.data.startTime);
  const end = new Date(parsed.data.endTime);
  const durationMin = Math.round((end.getTime() - start.getTime()) / 60_000);
  if (durationMin !== field.slot_duration_minutes) {
    return {
      error: "La duración de la reserva no coincide con la cancha. Vuelve a elegir horario.",
    };
  }

  const winMap = await fetchPricingWindowsForFields(supabase, [parsed.data.fieldId]);
  const windows = winMap.get(parsed.data.fieldId) ?? [];
  const hourly = resolveHourlyPriceFromWindows(
    windows,
    parsed.data.startTime,
    Number(field.hourly_price),
  );
  const hours = durationMin / 60;
  const totalPrice = hourly * hours;

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
    if (bookingErr.message.includes("bookings_composite_overlap")) {
      return {
        error:
          "Este horario choca con una reserva en modo combinado o en una de las canchas vinculadas. Elige otro horario.",
      };
    }
    return { error: bookingErr.message };
  }

  redirect("/user/reservas?status=pending");
}
