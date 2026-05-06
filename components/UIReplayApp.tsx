"use client";

import { useCallback, useEffect, useState } from "react";
import { RecorderPanel } from "@/components/RecorderPanel";
import { ReplayPanel } from "@/components/ReplayPanel";
import { SessionSidebar } from "@/components/SessionSidebar";
import type { ReplaySession, SessionDetail } from "@/lib/types";

export function UIReplayApp() {
  const [sessions, setSessions] = useState<ReplaySession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async (preferredId?: string) => {
    const response = await fetch("/api/sessions", { cache: "no-store" });
    if (!response.ok) {
      setSessions([]);
      setActiveId(null);
      return null;
    }
    const data = (await response.json()) as { sessions: ReplaySession[] };
    setSessions(data.sessions);
    const nextId = preferredId ?? activeId ?? data.sessions[0]?.id ?? null;
    setActiveId(nextId);
    return nextId;
  }, [activeId]);

  const loadSession = useCallback(async (id: string | null) => {
    if (!id) {
      setActiveSession(null);
      return;
    }
    const response = await fetch(`/api/sessions/${id}`, { cache: "no-store" });
    if (!response.ok) {
      setActiveSession(null);
      return;
    }
    const data = (await response.json()) as { session: SessionDetail };
    setActiveSession(data.session);
  }, []);

  useEffect(() => {
    let active = true;
    loadSessions().then((id) => {
      if (!active) {
        return;
      }
      setLoading(false);
      loadSession(id);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    loadSession(activeId);
  }, [activeId, loadSession]);

  const handleSaved = useCallback(async (id: string) => {
    await loadSessions(id);
    await loadSession(id);
  }, [loadSession, loadSessions]);

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1760px] flex-col gap-5">
        <header className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-panel backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.34em] text-mint">UI Replay</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">Interaction recording for people who debug with their eyes.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">Capture frontend behavior, replay every movement with smooth timing, and surface the moments that deserve engineering attention.</p>
            </div>
            <div className="grid min-w-[260px] grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Stored sessions</div>
                <div className="mt-1 font-mono text-2xl text-white">{sessions.length}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Backend</div>
                <div className="mt-2 text-sm font-semibold text-mint">API Routes</div>
              </div>
            </div>
          </div>
        </header>
        <div className="grid min-h-[900px] gap-5 xl:grid-cols-[360px_1fr]">
          <SessionSidebar sessions={sessions} activeId={activeId} onSelect={setActiveId} />
          <div className="min-w-0 space-y-6">
            {loading ? (
              <div className="grid h-[520px] place-items-center rounded-xl border border-white/10 bg-panel/80 text-slate-400">Loading replay workspace</div>
            ) : (
              <ReplayPanel session={activeSession} />
            )}
            <RecorderPanel onSaved={handleSaved} />
          </div>
        </div>
      </div>
    </main>
  );
}
