import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";

export const metadata: Metadata = {
  title: "Log in"
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPanel mode="login" />
    </Suspense>
  );
}
