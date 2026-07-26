import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { prisma } from "@/lib/prisma";
import { serializeDates } from "@/lib/serializers";
import { getCurrentUserId } from "@/lib/session";
import type { Application } from "@/types/app";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const userId = await getCurrentUserId();
  const applications = await prisma.application.findMany({
    where: { userId },
    include: { resume: true },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }]
  });

  return <KanbanBoard initialApplications={serializeDates(applications) as unknown as Application[]} />;
}
