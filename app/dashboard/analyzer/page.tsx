import { AnalysisHistory } from "@/components/dashboard/AnalysisHistory";
import { AnalyzerWorkspace } from "@/components/dashboard/AnalyzerWorkspace";
import { prisma } from "@/lib/prisma";
import { serializeDates } from "@/lib/serializers";
import { getCurrentUserId } from "@/lib/session";
import type { AnalysisHistoryItem, Resume } from "@/types/app";

export const dynamic = "force-dynamic";

export default async function AnalyzerPage() {
  const userId = await getCurrentUserId();

  const [rows, analysisRows] = await Promise.all([
    prisma.resumeVersion.findMany({
      where: { userId },
      include: { applications: { select: { id: true, company: true, role: true, status: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.jobAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        title: true,
        seniorityLevel: true,
        matchScore: true,
        requiredSkills: true,
        resumeSuggestions: true,
        createdAt: true
      }
    })
  ]);

  // `skills` is a JSON column (no scalar lists); normalize to string[] and
  // serialize dates so the data is safe to hand to a client component.
  const resumes = rows.map((row) => ({
    ...(serializeDates(row) as unknown as Resume),
    skills: (row.skills as string[]) ?? []
  }));

  const analyses: AnalysisHistoryItem[] = analysisRows.map((row) => ({
    id: row.id,
    title: row.title,
    seniorityLevel: row.seniorityLevel,
    matchScore: row.matchScore,
    requiredSkills: (row.requiredSkills as string[]) ?? [],
    resumeSuggestions: (row.resumeSuggestions as string[]) ?? [],
    createdAt: row.createdAt.toISOString()
  }));

  return (
    <div className="space-y-10">
      <AnalyzerWorkspace initialResumes={resumes} />
      <AnalysisHistory initialAnalyses={analyses} />
    </div>
  );
}
