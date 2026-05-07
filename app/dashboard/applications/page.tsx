import { getServerSession } from "next-auth";
import { ApplicationManager } from "@/components/dashboard/ApplicationManager";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDates } from "@/lib/serializers";
import type { Application, Resume } from "@/types/app";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return <ApplicationManager initialApplications={[]} resumes={[]} />;
  }
  const [applications, resumes] = await Promise.all([
    prisma.application.findMany({
      where: { userId: session.user.id },
      include: { resume: true },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.resumeVersion.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } })
  ]);

  return (
    <ApplicationManager
      initialApplications={serializeDates(applications) as unknown as Application[]}
      resumes={serializeDates(resumes) as unknown as Resume[]}
    />
  );
}
