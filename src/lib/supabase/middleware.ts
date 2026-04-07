import { createServerClient } from "@supabase/ssr";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

export type SessionMiddlewareResult = {
  response: NextResponse;
  user: User | null;
  supabase: SupabaseClient<Database> | null;
};

export async function updateSession(
  request: NextRequest,
): Promise<SessionMiddlewareResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      response: NextResponse.next({ request }),
      user: null,
      supabase: null,
    };
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    const t0 = Date.now();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // #region agent log
    fetch("http://127.0.0.1:7654/ingest/527c6de2-20d8-45a0-90a3-9d8a7801669f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "8117cf",
      },
      body: JSON.stringify({
        sessionId: "8117cf",
        runId: "verify",
        hypothesisId: "H-timeout",
        location: "middleware.ts:getUser-ok",
        message: "getUser completed",
        data: { ms: Date.now() - t0, hasUser: Boolean(user) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return { response: supabaseResponse, user, supabase };
  } catch (err) {
    // #region agent log
    fetch("http://127.0.0.1:7654/ingest/527c6de2-20d8-45a0-90a3-9d8a7801669f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "8117cf",
      },
      body: JSON.stringify({
        sessionId: "8117cf",
        runId: "verify",
        hypothesisId: "H-timeout",
        location: "middleware.ts:getUser-catch",
        message: "getUser threw",
        data: { errName: err instanceof Error ? err.name : "unknown", errMsg: err instanceof Error ? err.message : String(err) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    /* Red caída, DNS, sandbox Edge, etc.: no tumbar toda la petición */
    return {
      response: supabaseResponse,
      user: null,
      supabase: null,
    };
  }
}
