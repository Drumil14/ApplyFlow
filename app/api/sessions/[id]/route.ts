import { NextResponse } from "next/server";
import { getSession } from "@/lib/storage";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getSession(id);
  if (!session) {
    return NextResponse.json({ message: "Session not found" }, { status: 404 });
  }
  return NextResponse.json({ session });
}
