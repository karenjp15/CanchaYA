"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOut(): Promise<void> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  ) {
    redirect("/");
  }

  const supabase = await createServerActionClient();
  await supabase.auth.signOut();
  redirect("/");
}
