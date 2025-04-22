// app/signup/page.tsx
import React, { Suspense } from "react";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center">Loading form…</p>}>
      <SignupForm />
    </Suspense>
  );
}