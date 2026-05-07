import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const { userId, response } = await requireUser();
  if (response) return response;

  const activities = await prisma.activity.findMany({
    where: { userId },
    include: { application: { select: { company: true, role: true, status: true } } },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  return NextResponse.json({ activities });
}
