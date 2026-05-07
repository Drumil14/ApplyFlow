import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const { id } = await context.params;
  const exists = await prisma.resumeVersion.findFirst({ where: { id, userId: userId as string } });
  if (!exists) return NextResponse.json({ message: "Resume not found." }, { status: 404 });

  const body = await request.json();
  const resume = await prisma.resumeVersion.update({
    where: { id },
    data: {
      title: body.title !== undefined ? String(body.title) : undefined,
      versionTag: body.versionTag !== undefined ? String(body.versionTag) : undefined,
      targetRole: body.targetRole !== undefined ? String(body.targetRole) : undefined,
      score: body.score !== undefined ? Number(body.score) : undefined
    }
  });

  return NextResponse.json({ resume });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const { id } = await context.params;
  const exists = await prisma.resumeVersion.findFirst({ where: { id, userId: userId as string } });
  if (!exists) return NextResponse.json({ message: "Resume not found." }, { status: 404 });

  await prisma.resumeVersion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
