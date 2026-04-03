"use server";

import { createClient } from "@/lib/supabase/server";
import { resolvePostAuthPath } from "@/lib/auth/profile";
import { safeInternalPath } from "@/lib/auth/paths";
import { loginSchema, registerSchema } from "@/lib/schemas/auth";
import { redirect } from "next/navigation";

export type AuthActionState = {
  error?: string;
  message?: string;
};

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export async function signInWithPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      error:
        parsed.error.flatten().fieldErrors.email?.[0]
        ?? parsed.error.flatten().fieldErrors.password?.[0]
        ?? "Datos inválidos",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos"
          : error.message,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No se pudo iniciar sesión" };

  const rawNext = formData.get("next");
  const path = await resolvePostAuthPath(
    user.id,
    typeof rawNext === "string" ? rawNext : null,
  );
  redirect(path);
}

export async function signUpWithPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    phone: formData.get("phone"),
    accountType: formData.get("accountType"),
  });

  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    const first =
      f.email?.[0]
      ?? f.fullName?.[0]
      ?? f.password?.[0]
      ?? f.passwordConfirm?.[0]
      ?? f.phone?.[0]
      ?? f.accountType?.[0]
      ?? "Revisa los campos";
    return { error: first };
  }

  const appRole = parsed.data.accountType === "owner" ? "ADMIN" : "USER";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        app_role: appRole,
      },
    },
  });

  if (error) return { error: error.message };

  if (data.session) {
    if (parsed.data.accountType === "owner") {
      redirect("/admin/dashboard");
    }
    redirect("/");
  }

  return {
    message:
      "Cuenta creada. Revisa tu correo para confirmar e iniciar sesión.",
  };
}

export async function signInWithGoogle(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createClient();
  const callback = new URL("/auth/callback", siteOrigin());
  const rawNext = formData.get("next");
  if (typeof rawNext === "string" && rawNext.trim().length > 0) {
    callback.searchParams.set("next", safeInternalPath(rawNext));
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback.toString(),
    },
  });

  if (error) return { error: error.message };
  if (data.url) redirect(data.url);
  return { error: "No se pudo iniciar con Google" };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
