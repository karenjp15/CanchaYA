"use server";

import { debugAgentLogServer } from "@/lib/debug-agent-log-server";
import { createServerActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOut(): Promise<void> {
  // #region agent log
  debugAgentLogServer({
    hypothesisId: "H-signout",
    location: "sign-out.ts:entry",
    message: "signOut called",
    runId: "verify",
    data: {
      envOk: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
          && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
      ),
    },
  });
  // #endregion
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  ) {
    redirect("/");
  }

  const supabase = await createServerActionClient();
  await supabase.auth.signOut();
  // #region agent log
  debugAgentLogServer({
    hypothesisId: "H-signout",
    location: "sign-out.ts:before-redirect",
    message: "signOut done",
    runId: "verify",
    data: {},
  });
  // #endregion
  redirect("/");
}
