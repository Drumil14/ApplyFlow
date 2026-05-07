import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";

export const metadata: Metadata = {
  title: "Sign up"
};

export default function SignupPage() {
  return (
    <Suspense>
      <AuthPanel mode="signup" />
    </Suspense>
  );
}
