import { ApplicationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const statusValues = new Set(Object.values(ApplicationStatus));

function parseApplication(body: Record<string, unknown>) {
  const status = String(body.status ?? "APPLIED");

  return {
    company: String(body.company ?? "").trim(),
    role: String(body.role ?? "").trim(),
    status: statusValues.has(status as ApplicationStatus) ? (status as ApplicationStatus) : ApplicationStatus.APPLIED,
    location: body.location ? String(body.location) : null,
    workMode: body.workMode ? String(body.workMode) : "Hybrid",
    salaryMin: body.salaryMin ? Number(body.salaryMin) : null,
    salaryMax: body.salaryMax ? Number(body.salaryMax) : null,
    deadline: body.deadline ? new Date(String(body.deadline)) : null,
    appliedAt: body.appliedAt ? new Date(String(body.appliedAt)) : new Date(),
    recruiterName: body.recruiterName ? String(body.recruiterName) : null,
    recruiterEmail: body.recruiterEmail ? String(body.recruiterEmail) : null,
    notes: body.notes ? String(body.notes) : null,
    links: Array.isArray(body.links) ? body.links.map(String).filter(Boolean) : [],
    priority: body.priority ? Number(body.priority) : 2,
    resumeId: body.resumeId ? String(body.resumeId) : null
  };
}

export async function GET() {
  const { userId, response } = await requireUser();
  if (response) return response;

  const applications = await prisma.application.findMany({
    where: { userId },
    include: { resume: true },
    orderBy: [{ updatedAt: "desc" }]
  });

  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const data = parseApplication(await request.json());
  if (!data.company || !data.role) {
    return NextResponse.json({ message: "Company and role are required." }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: {
      ...data,
      userId: userId as string,
      activities: {
        create: {
          userId: userId as string,
          type: "APPLICATION_CREATED",
          message: `Added ${data.role} at ${data.company}.`
        }
      }
    },
    include: { resume: true }
  });

  return NextResponse.json({ application }, { status: 201 });
}
