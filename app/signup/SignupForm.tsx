// app/signup/SignupForm.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signup } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Eye, EyeSlash, GoogleLogo } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import useIsMobile from "@/hooks/useIsMobile";

export default function SignupForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const errorFromUrl = searchParams.get("error");
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]  = useState("");
  const [email, setEmail]        = useState("");
  const [password, setPassword]  = useState("");
  const [error, setError]        = useState<string | null>(errorFromUrl);
  const [isLoading, setIsLoading]= useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isMobile = useIsMobile();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // adjust this to where you want users to land post-login
        redirectTo: `${window.location.origin}/main/dashboard`,
      },
    });
    if (error) setError(error.message);
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)] px-4 relative">
      <Image src="/Background.png" alt="Hero" fill className="object-cover w-fill h-full absolute top-0 left-0 opacity-60" />
      <Card className="w-full max-w-md z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form
            action={signup}
            onSubmit={() => setIsLoading(true)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="focus-visible:ring-0"
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min={1}
                className="focus-visible:ring-0"
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex items-center justify-between gap-2">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={!showPassword ? "********" : "Password"}
                className="focus-visible:ring-0"
              />
              <Button
            type="button"
            variant={"default"}
            onClick={() => setShowPassword((v) => !v)}
            className={cn("flex items-center bg-primary/25 hover:bg-primary/50 border-1 border-primary/25", showPassword && "bg-primary/50")}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeSlash weight="duotone" size={20} className="" />
            ) : (
              <Eye weight="duotone" size={20} className="" />
            )}
          </Button>
          </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing up…" : "Sign up"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4 text-center text-sm text-muted-foreground">
            <span className="bg-white px-2">or</span>
            <hr className="absolute inset-0 top-1/2 border-t border-[var(--border)]" />
          </div>

          {/* Google OAuth */}
          <Button
            variant="default"
            className="w-full flex items-center justify-center bg-primary/25 hover:bg-primary/50"
            onClick={handleGoogleAuth}
            disabled={isLoading}
          >
            <GoogleLogo weight="duotone" size={20} />
            {isLoading ? "Redirecting…" : "Continue with Google"}
          </Button>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[var(--primary)] underline underline-offset-4 hover:text-[var(--primary)]/90"
            >
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}