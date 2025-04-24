// app/login/LoginForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={login} className="space-y-4">
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
        <div className="flex gap-2 items-center">
          {/* <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            required
            className="focus-visible:ring-0 pr-10"
          /> */}
          <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
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

      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  );
}