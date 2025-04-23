// app/login/LoginPageClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@phosphor-icons/react";

export default function LoginPageClient() {
  const supabase = createClient();
  const router   = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // 1) Listen for when Supabase parses the OAuth response and sets the session
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        router.push("/main/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  // 2) Kick off the Google OAuth implicit flow
  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      // no `options.redirectTo` here—implicit flow will land you back on your origin
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      <Button
        variant="default"
        className="w-full bg-primary/25 hover:bg-primary/50"
        onClick={handleGoogle}
        disabled={loading}
      >
        <GoogleLogo size={20} weight="duotone" />
        {loading ? "Redirecting…" : "Continue with Google"}
      </Button>
    </div>
  );
}