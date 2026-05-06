"use client";

import { CaptureSurface } from "@/components/CaptureSurface";
import { StatPill } from "@/components/StatPill";
import { formatTime } from "@/lib/time";
import { useRecorder } from "@/hooks/useRecorder";

type RecorderPanelProps = {
  onSaved: (id: string) => void;
};

export function RecorderPanel({ onSaved }: RecorderPanelProps) {
  const recorder = useRecorder(onSaved);

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-mint">Recorder</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">Capture a fresh session</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {!recorder.isRecording ? (
              <button onClick={recorder.start} className="rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-ink transition hover:scale-[1.02]">Start recording</button>
            ) : (
              <button onClick={recorder.stop} className="rounded-lg bg-flame px-4 py-2 text-sm font-semibold text-ink transition hover:scale-[1.02]">Stop</button>
            )}
            <button onClick={recorder.reset} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]">Reset</button>
            <button
              onClick={recorder.save}
              disabled={recorder.isRecording || recorder.eventCount === 0}
              className="rounded-lg border border-mint/30 bg-mint/10 px-4 py-2 text-sm font-semibold text-mint transition enabled:hover:bg-mint enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save session
            </button>
          </div>
        </div>
        <CaptureSurface mode="record" handlers={recorder.handlers} />
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-panel/80 p-5 shadow-panel backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</div>
              <div className="mt-2 text-xl font-semibold text-white">{recorder.isRecording ? "Recording" : recorder.eventCount ? "Ready to save" : "Idle"}</div>
            </div>
            <div className={`h-3 w-3 rounded-full ${recorder.isRecording ? "bg-flame shadow-[0_0_18px_rgba(255,138,91,0.9)]" : "bg-mint"}`} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatPill label="Captured" value={`${recorder.eventCount}`} />
            <StatPill label="Elapsed" value={formatTime(recorder.duration)} />
          </div>
          <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-400">
            The recorder samples pointer movement, clicks, scroll depth, and input changes from the embedded product surface. Saved sessions become available immediately in the replay library.
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Signal model</div>
          <div className="mt-4 space-y-3">
            {["45ms pointer throttle", "Timestamped event stream", "Target-aware interaction hints", "JSON-backed API persistence"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
