import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/app/DashboardShell";
import { authOptions } from "@/lib/auth";
import { DEMO_EMAIL, ensureDemoWorkspace } from "@/lib/demo";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.email === DEMO_EMAIL) {
    await ensureDemoWorkspace(prisma);
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
