import { promises as fs } from "fs";
import path from "path";
import type { ReplayEvent, ReplaySession, SessionDetail } from "./types";

type Database = {
  sessions: ReplaySession[];
  events: ReplayEvent[];
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "db.json");
let fallbackDatabase: Database | null = null;

const seedEvents: ReplayEvent[] = [
  { id: "evt_seed_1", type: "mousemove", x: 98, y: 122, value: null, timestamp: 0, sessionId: "session_seed_alpha", targetId: null, scrollY: null },
  { id: "evt_seed_2", type: "mousemove", x: 248, y: 156, value: null, timestamp: 420, sessionId: "session_seed_alpha", targetId: null, scrollY: null },
  { id: "evt_seed_3", type: "click", x: 305, y: 178, value: null, timestamp: 860, sessionId: "session_seed_alpha", targetId: "hero-cta", scrollY: null },
  { id: "evt_seed_4", type: "scroll", x: null, y: null, value: null, timestamp: 1420, sessionId: "session_seed_alpha", targetId: null, scrollY: 220 },
  { id: "evt_seed_5", type: "click", x: 475, y: 356, value: null, timestamp: 2180, sessionId: "session_seed_alpha", targetId: "plan-card", scrollY: null },
  { id: "evt_seed_6", type: "input", x: 430, y: 520, value: "dev@company.io", timestamp: 3150, sessionId: "session_seed_alpha", targetId: "email-input", scrollY: null },
  { id: "evt_seed_7", type: "mousemove", x: 680, y: 510, value: null, timestamp: 3960, sessionId: "session_seed_alpha", targetId: null, scrollY: null },
  { id: "evt_seed_8", type: "click", x: 702, y: 592, value: null, timestamp: 4550, sessionId: "session_seed_alpha", targetId: "submit-button", scrollY: null }
];

const seed: Database = {
  sessions: [
    {
      id: "session_seed_alpha",
      createdAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
      duration: 4550,
      eventCount: seedEvents.length
    }
  ],
  events: seedEvents
};

export async function readDatabase(): Promise<Database> {
  if (process.env.NETLIFY) {
    fallbackDatabase = fallbackDatabase ?? seed;
    return fallbackDatabase;
  }

  await fs.mkdir(dataDir, { recursive: true });
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw) as Database;
  } catch {
    await writeDatabase(seed);
    return seed;
  }
}

export async function writeDatabase(database: Database) {
  if (process.env.NETLIFY) {
    fallbackDatabase = database;
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(database, null, 2));
}

export async function listSessions() {
  const database = await readDatabase();
  return database.sessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSession(id: string): Promise<SessionDetail | null> {
  const database = await readDatabase();
  const session = database.sessions.find((item) => item.id === id);
  if (!session) {
    return null;
  }
  const events = database.events.filter((event) => event.sessionId === id).sort((a, b) => a.timestamp - b.timestamp);
  return { ...session, events };
}

export async function saveSession(session: ReplaySession, events: ReplayEvent[]) {
  const database = await readDatabase();
  const nextSessions = [session, ...database.sessions.filter((item) => item.id !== session.id)];
  const nextEvents = [...database.events.filter((event) => event.sessionId !== session.id), ...events];
  await writeDatabase({ sessions: nextSessions, events: nextEvents });
  return { ...session, events };
}
