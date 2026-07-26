import { ApplicationManager } from "@/components/dashboard/ApplicationManager";
import { prisma } from "@/lib/prisma";
import { serializeDates } from "@/lib/serializers";
import { getCurrentUserId } from "@/lib/session";
import type { Application, Resume } from "@/types/app";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const userId = await getCurrentUserId();
  const [applications, resumes] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      include: { resume: true },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.resumeVersion.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
  ]);

  return (
    <ApplicationManager
      initialApplications={serializeDates(applications) as unknown as Application[]}
      resumes={serializeDates(resumes) as unknown as Resume[]}
    />
  );
}
