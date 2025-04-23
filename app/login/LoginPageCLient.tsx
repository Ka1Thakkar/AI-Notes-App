// app/login/LoginPageClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@phosphor-icons/react";

export default function LoginPageClient() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // must match one of your Auth → Settings → Redirect URLs
        redirectTo: `${window.location.origin}/main/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
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