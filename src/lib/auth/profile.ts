import "server-only";

import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/auth/paths";
import { agentLog } from "@/lib/debug-agent-log";
import type { Database } from "@/types/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/**
 * Tras login: dueños van al dashboard si no hay `next` explícito en el flujo.
 * `nextParam` debe ser el valor crudo del query/form (sin normalizar antes).
 */
export async function resolvePostAuthPath(
  userId: string,
  nextParam: string | null | undefined,
): Promise<string> {
  const hasExplicit =
    typeof nextParam === "string" && nextParam.trim().length > 0;
  const next = safeInternalPath(hasExplicit ? nextParam : null);

  const supabase = await createClient();
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  // #region agent log
  agentLog({
    location: "profile.ts:resolvePostAuthPath",
    message: "profile for post-auth path",
    hypothesisId: "D",
    data: {
      hasExplicit,
      role: profile?.role ?? null,
      profileError: profileErr?.message ?? null,
      next,
    },
  });
  // #endregion

  if (profile?.role === "ADMIN" && !hasExplicit) {
    return "/admin/dashboard";
  }

  return next;
}
