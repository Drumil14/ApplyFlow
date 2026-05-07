import { getServerSession } from "next-auth";
import { ResumeManager } from "@/components/dashboard/ResumeManager";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDates } from "@/lib/serializers";
import type { Resume } from "@/types/app";

export const dynamic = "force-dynamic";

export default async function ResumesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return <ResumeManager initialResumes={[]} />;
  }
  const resumes = await prisma.resumeVersion.findMany({
    where: { userId: session.user.id },
    include: { applications: { select: { id: true, company: true, role: true, status: true } } },
    orderBy: { createdAt: "desc" }
  });

  return <ResumeManager initialResumes={serializeDates(resumes) as unknown as Resume[]} />;
}
