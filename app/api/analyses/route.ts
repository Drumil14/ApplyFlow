import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const { userId, response } = await requireUser();
  if (response) return response;

  const rows = await prisma.jobAnalysis.findMany({
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
  });

  const analyses = rows.map((row) => ({
    id: row.id,
    title: row.title,
    seniorityLevel: row.seniorityLevel,
    matchScore: row.matchScore,
    requiredSkills: (row.requiredSkills as string[]) ?? [],
    resumeSuggestions: (row.resumeSuggestions as string[]) ?? [],
    createdAt: row.createdAt.toISOString()
  }));

  return NextResponse.json({ analyses });
}
