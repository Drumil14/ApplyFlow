import { getServerSession } from "next-auth";
import { AnalyzerWorkspace } from "@/components/dashboard/AnalyzerWorkspace";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnalyzerPage() {
  const session = await getServerSession(authOptions);

  const resumes = session?.user.id
    ? await prisma.resumeVersion.findMany({
        where: { userId: session.user.id },
        select: { id: true, title: true, versionTag: true, skills: true },
        orderBy: { createdAt: "desc" }
      })
    : [];

  return <AnalyzerWorkspace resumes={resumes} />;
}
