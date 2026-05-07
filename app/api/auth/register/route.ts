import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").toLowerCase().trim();
  const password = String(body.password ?? "");

  if (!name || !email || password.length < 8) {
    return NextResponse.json(
      { message: "Name, email, and an 8+ character password are required." },
      { status: 400 }
    );
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ message: "An account already exists for this email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      targetRole: "Software Engineer"
    },
    select: {
      id: true,
      email: true,
      name: true
    }
  });

  await prisma.activity.create({
    data: {
      userId: user.id,
      type: "APPLICATION_CREATED",
      message: "Welcome to ApplyFlow. Your workspace is ready."
    }
  });

  return NextResponse.json({ user }, { status: 201 });
}
