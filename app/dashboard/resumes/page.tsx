import { ResumeManager } from "@/components/dashboard/ResumeManager";
import { prisma } from "@/lib/prisma";
import { serializeDates } from "@/lib/serializers";
import { getCurrentUserId } from "@/lib/session";
import type { Resume } from "@/types/app";

export const dynamic = "force-dynamic";

export default async function ResumesPage() {
  const userId = await getCurrentUserId();
  const resumes = await prisma.resumeVersion.findMany({
    where: { userId },
    include: { applications: { select: { id: true, company: true, role: true, status: true } } },
    orderBy: { createdAt: "desc" }
  });

  return <ResumeManager initialResumes={serializeDates(resumes) as unknown as Resume[]} />;
}
