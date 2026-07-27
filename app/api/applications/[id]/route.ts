import { ApplicationStatus } from "@/lib/enums";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const statusValues = new Set(Object.values(ApplicationStatus));

async function findApplication(id: string, userId: string) {
  return prisma.application.findFirst({ where: { id, userId } });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const { id } = await context.params;
  const existing = await findApplication(id, userId as string);
  if (!existing) return NextResponse.json({ message: "Application not found." }, { status: 404 });

  const body = await request.json();
  const status = body.status && statusValues.has(String(body.status) as ApplicationStatus)
    ? (String(body.status) as ApplicationStatus)
    : undefined;

  const application = await prisma.application.update({
    where: { id },
    data: {
      company: body.company !== undefined ? String(body.company).trim() : undefined,
      role: body.role !== undefined ? String(body.role).trim() : undefined,
      status,
      location: body.location !== undefined ? String(body.location) : undefined,
      workMode: body.workMode !== undefined ? String(body.workMode) : undefined,
      salaryMin: body.salaryMin !== undefined && body.salaryMin !== "" ? Number(body.salaryMin) : undefined,
      salaryMax: body.salaryMax !== undefined && body.salaryMax !== "" ? Number(body.salaryMax) : undefined,
      deadline: body.deadline !== undefined && body.deadline ? new Date(String(body.deadline)) : undefined,
      recruiterName: body.recruiterName !== undefined ? String(body.recruiterName) : undefined,
      recruiterEmail: body.recruiterEmail !== undefined ? String(body.recruiterEmail) : undefined,
      notes: body.notes !== undefined ? String(body.notes) : undefined,
      links: Array.isArray(body.links) ? body.links.map(String).filter(Boolean) : undefined,
      priority: body.priority !== undefined ? Number(body.priority) : undefined,
      resumeId: body.resumeId !== undefined ? String(body.resumeId || "") || null : undefined,
      activities: {
        create: {
          userId: userId as string,
          type: status && status !== existing.status ? "STATUS_CHANGED" : "APPLICATION_UPDATED",
          message:
            status && status !== existing.status
              ? `Moved ${existing.company} from ${existing.status.replace("_", " ")} to ${status.replace("_", " ")}.`
              : `Updated ${existing.company}.`
        }
      }
    },
    include: { resume: true }
  });

  return NextResponse.json({ application });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const { id } = await context.params;
  const existing = await findApplication(id, userId as string);
  if (!existing) return NextResponse.json({ message: "Application not found." }, { status: 404 });

  await prisma.application.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
