import { formatTime } from "@/lib/time";
import type { ReplaySession } from "@/lib/types";

type SessionSidebarProps = {
  sessions: ReplaySession[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function SessionSidebar({ sessions, activeId, onSelect }: SessionSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-panel/80 shadow-panel backdrop-blur">
      <div className="border-b border-white/10 p-5">
        <div className="text-xs uppercase tracking-[0.28em] text-mint">Sessions</div>
        <h2 className="mt-2 text-xl font-semibold text-white">Replay Library</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Stored recordings from real capture runs, ready for timeline playback and inspection.</p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {sessions.map((session) => {
          const active = session.id === activeId;
          return (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={`w-full rounded-lg border p-4 text-left transition ${active ? "border-mint/70 bg-mint/10 shadow-glow" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-slate-400">{session.id.replace("session_", "")}</div>
                  <div className="mt-1 text-sm font-medium text-white">{new Date(session.createdAt).toLocaleString()}</div>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${active ? "bg-mint text-ink" : "bg-white/10 text-slate-300"}`}>
                  {active ? "Live" : "Open"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-black/20 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Duration</div>
                  <div className="mt-1 font-mono text-sm text-slate-200">{formatTime(session.duration)}</div>
                </div>
                <div className="rounded-md bg-black/20 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Events</div>
                  <div className="mt-1 font-mono text-sm text-slate-200">{session.eventCount}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
