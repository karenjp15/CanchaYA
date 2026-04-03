import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";
import { resolvePostAuthPath } from "@/lib/auth/profile";

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");

  if (!url || !key) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  const path = await resolvePostAuthPath(user.id, nextParam);
  return NextResponse.redirect(new URL(path, request.url));
}
