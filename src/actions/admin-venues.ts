"use server";

import { createClient } from "@/lib/supabase/server";
import {
  venueFormSchema,
  parseOptionalCoord,
} from "@/lib/schemas/venue";
import { revalidatePath } from "next/cache";

export type VenueActionState = {
  error?: string;
  message?: string;
};

export async function createVenue(
  _prev: VenueActionState,
  formData: FormData,
): Promise<VenueActionState> {
  const parsed = venueFormSchema.safeParse({
    name: formData.get("name"),
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") return { error: "Sin permiso" };

  const lat = parseOptionalCoord(formData.get("latitude"));
  const lng = parseOptionalCoord(formData.get("longitude"));

  const { error } = await supabase.from("venues").insert({
    owner_id: user.id,
    name: parsed.data.name,
    address: parsed.data.address,
    latitude: lat,
    longitude: lng,
    parking_available: parsed.data.parkingAvailable,
    sells_liquor: parsed.data.sellsLiquor,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/locales");
  revalidatePath("/explorar");
  return { message: "Establecimiento creado" };
}

export async function updateVenue(
  _prev: VenueActionState,
  formData: FormData,
): Promise<VenueActionState> {
  const venueId = formData.get("venueId") as string;
  if (!venueId) return { error: "ID de establecimiento requerido" };

  const parsed = venueFormSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    parkingAvailable: formData.get("parkingAvailable") === "true",
    sellsLiquor: formData.get("sellsLiquor") === "true",
  });

  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Revisa los campos" };
  }

  const supabase = await createClient();
  const lat = parseOptionalCoord(formData.get("latitude"));
  const lng = parseOptionalCoord(formData.get("longitude"));

  const { error } = await supabase
    .from("venues")
    .update({
      name: parsed.data.name,
      address: parsed.data.address,
      latitude: lat,
      longitude: lng,
      parking_available: parsed.data.parkingAvailable,
      sells_liquor: parsed.data.sellsLiquor,
    })
    .eq("id", venueId);

  if (error) return { error: error.message };

  revalidatePath("/admin/locales");
  revalidatePath("/admin/canchas");
  revalidatePath("/explorar");
  return { message: "Establecimiento actualizado" };
}
