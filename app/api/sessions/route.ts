import { NextResponse } from "next/server";
import { createId } from "@/lib/ids";
import { listSessions, saveSession } from "@/lib/storage";
import type { ReplayEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessions = await listSessions();
    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ sessions: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { events?: ReplayEvent[] };
    const sessionId = createId("session");
    const createdAt = new Date().toISOString();
    const events = (body.events ?? []).map((event) => ({
      ...event,
      id: event.id || createId("evt"),
      sessionId,
      timestamp: Math.max(0, Math.round(event.timestamp)),
      x: event.x === undefined ? null : event.x,
      y: event.y === undefined ? null : event.y,
      value: event.value === undefined ? null : event.value
    }));
    const duration = events.reduce((max, event) => Math.max(max, event.timestamp), 0);
    const session = {
      id: sessionId,
      createdAt,
      duration,
      eventCount: events.length
    };
    const saved = await saveSession(session, events);
    return NextResponse.json({ session: saved }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to save session" }, { status: 200 });
  }
}
