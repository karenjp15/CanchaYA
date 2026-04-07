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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { response: supabaseResponse, user, supabase };
  } catch {
    /* Red caída, DNS, sandbox Edge, etc.: no tumbar toda la petición */
    return {
      response: supabaseResponse,
      user: null,
      supabase: null,
    };
  }
}
