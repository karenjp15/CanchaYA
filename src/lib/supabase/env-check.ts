import "server-only";

/** Comprueba variables públicas de Supabase (importar desde Server Actions; no como helper local en el mismo archivo `"use server"`). */
export function missingSupabaseEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return !url || !key;
}

/** Origen público de la app (OAuth callback, enlaces). */
export function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}
