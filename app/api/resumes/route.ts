import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { extractSkills } from "@/lib/skills";

export async function GET() {
  const { userId, response } = await requireUser();
  if (response) return response;

  const resumes = await prisma.resumeVersion.findMany({
    where: { userId },
    include: { applications: { select: { id: true, company: true, role: true, status: true } } },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const fileName = String(body.fileName ?? "").trim();

  if (!title || !fileName) {
    return NextResponse.json({ message: "Resume title and file name are required." }, { status: 400 });
  }

  // Ingest pasted resume text once, at upload time: store it and extract skills.
  const contentText = String(body.contentText ?? "").trim();
  const skills = extractSkills(contentText);

  const resume = await prisma.resumeVersion.create({
    data: {
      title,
      fileName,
      versionTag: String(body.versionTag ?? "v1"),
      fileUrl: body.fileUrl ? String(body.fileUrl) : null,
      targetRole: body.targetRole ? String(body.targetRole) : null,
      contentText: contentText || null,
      skills,
      score: body.score ? Number(body.score) : 0,
      userId: userId as string
    }
  });

  await prisma.activity.create({
    data: {
      userId: userId as string,
      type: "RESUME_UPLOADED",
      message: `Uploaded ${title}.`
    }
  });

  return NextResponse.json({ resume }, { status: 201 });
}
