import { AnalyzerWorkspace } from "@/components/dashboard/AnalyzerWorkspace";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AnalyzerPage() {
  const userId = await getCurrentUserId();

  const rows = await prisma.resumeVersion.findMany({
    where: { userId },
    select: { id: true, title: true, versionTag: true, skills: true },
    orderBy: { createdAt: "desc" }
  });

  // `skills` is a JSON column (SQLite has no scalar lists); normalize to string[].
  const resumes = rows.map((row) => ({
    ...row,
    skills: (row.skills as string[]) ?? []
  }));

  return <AnalyzerWorkspace resumes={resumes} />;
}
