import { getServerSession } from "next-auth";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDates } from "@/lib/serializers";
import type { Application } from "@/types/app";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return <KanbanBoard initialApplications={[]} />;
  }
  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: { resume: true },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }]
  });

  return <KanbanBoard initialApplications={serializeDates(applications) as unknown as Application[]} />;
}
