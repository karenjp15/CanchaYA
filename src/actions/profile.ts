"use server";

import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/schemas/profile";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ProfileActionState = {
  error?: string;
  message?: string;
};

export async function updateProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
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

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      address: parsed.data.address ?? null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/user/perfil");
  revalidatePath("/admin/perfil");
  return { message: "Perfil actualizado" };
}

export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
