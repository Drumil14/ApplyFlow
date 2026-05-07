import { getServerSession } from "next-auth";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDates } from "@/lib/serializers";
import type { Activity, Application, Resume } from "@/types/app";

export const dynamic = "force-dynamic";

async function getData() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return { applications: [], resumes: [], activities: [] };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      applications: { include: { resume: true }, orderBy: { updatedAt: "desc" } },
      resumes: { orderBy: { createdAt: "desc" } },
      activities: {
        include: { application: { select: { company: true, role: true, status: true } } },
        orderBy: { createdAt: "desc" },
        take: 14
      }
    }
  });

  return serializeDates({
    applications: (user?.applications ?? []) as unknown as Application[],
    resumes: (user?.resumes ?? []) as unknown as Resume[],
    activities: (user?.activities ?? []) as unknown as Activity[]
  });
}

export default async function DashboardPage() {
  const data = await getData();
  return <DashboardOverview {...data} />;
}
