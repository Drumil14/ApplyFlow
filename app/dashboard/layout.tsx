import type { ReactNode } from "react";
import { DashboardShell } from "@/components/app/DashboardShell";
import { SplashScreen } from "@/components/app/SplashScreen";
import { DEMO_EMAIL, ensureDemoWorkspace } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  // Single-user demo: keep the implicit user's workspace seeded and populated.
  if (user.email === DEMO_EMAIL) {
    await ensureDemoWorkspace(prisma);
  }

  return (
    <>
      <SplashScreen />
      <DashboardShell user={user}>{children}</DashboardShell>
    </>
  );
}
