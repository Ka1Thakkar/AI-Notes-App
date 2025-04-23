// app/login/actions.tsx
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Email + password flow
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // send back to login with error in URL
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // optionally revalidate any cached pages
  revalidatePath("/", "layout");
  // finally send the user to their dashboard
  redirect("/main/dashboard");
}