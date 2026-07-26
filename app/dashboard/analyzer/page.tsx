import { AnalyzerWorkspace } from "@/components/dashboard/AnalyzerWorkspace";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AnalyzerPage() {
  const userId = await getCurrentUserId();

  const resumes = await prisma.resumeVersion.findMany({
    where: { userId },
    select: { id: true, title: true, versionTag: true, skills: true },
    orderBy: { createdAt: "desc" }
  });

  return <AnalyzerWorkspace resumes={resumes} />;
}
