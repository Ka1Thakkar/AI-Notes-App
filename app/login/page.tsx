// app/login/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { login } from "./actions";
import Link from "next/link";
import LoginPageClient from "./LoginPageCLient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If already signed in, send straight to /main/dashboard
  if (session) {
    redirect("/main/dashboard");
  }

  // Pull any error from query-string (next/navigation useSearchParams cannot be used in server)
  // We read it client-side inside LoginPageClient if you wish to show it there.

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email + Password */}
          <LoginForm />
          {/* <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
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
                type="password"
                placeholder = "********"
                required
                className="focus-visible:ring-0"
              />
              <Button variant="default" className="">
              </Button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form> */}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--background)] px-2 text-[var(--muted-foreground)]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <LoginPageClient />
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-[var(--primary)] underline underline-offset-4 hover:text-[var(--primary)]/90"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}