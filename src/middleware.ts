import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { agentLog } from "@/lib/debug-agent-log";

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const path = request.nextUrl.pathname;

  if (path.startsWith("/login") || path.startsWith("/admin")) {
    // #region agent log
    agentLog({
      location: "middleware.ts:session",
      message: "middleware session snapshot",
      hypothesisId: "C",
      data: {
        path,
        hasUser: Boolean(user),
        hasSupabaseClient: Boolean(supabase),
      },
    });
    // #endregion
  }

  if (path.startsWith("/user")) {
    if (!user) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      login.searchParams.set(
        "next",
        `${path}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(login);
    }
  }

  if (path.startsWith("/admin")) {
    if (!user) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      login.searchParams.set(
        "next",
        `${path}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(login);
    }
    if (supabase) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role !== "ADMIN") {
        const home = request.nextUrl.clone();
        home.pathname = "/";
        home.search = "";
        return NextResponse.redirect(home);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
