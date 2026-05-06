import type { ReplayEvent } from "@/lib/types";
import type React from "react";

type CaptureSurfaceProps = {
  mode: "record" | "replay";
  handlers?: {
    onMouseMove: (event: React.MouseEvent<HTMLElement>) => void;
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    onScroll: (event: React.UIEvent<HTMLElement>) => void;
    onInput: (event: React.FormEvent<HTMLElement>) => void;
  };
  viewportRef?: React.RefObject<HTMLDivElement | null>;
  cursor?: { x: number; y: number; visible: boolean };
  click?: ReplayEvent;
  activeTargetId?: string | null;
  inputValues?: Record<string, string>;
};

export function CaptureSurface({ mode, handlers, viewportRef, cursor, click, activeTargetId, inputValues = {} }: CaptureSurfaceProps) {
  const highlight = (key: string) => activeTargetId === key ? "ring-2 ring-mint/80 shadow-[0_0_30px_rgba(93,242,196,0.22)]" : "";
  const passive = mode === "replay" ? "pointer-events-none select-none" : "";

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0f16] shadow-panel">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-[#ff6868]" />
        <div className="h-3 w-3 rounded-full bg-[#ffd166]" />
        <div className="h-3 w-3 rounded-full bg-[#65f2bd]" />
        <div className="ml-3 flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-xs text-slate-400">https://product.local/onboarding</div>
      </div>
      <div
        ref={viewportRef}
        className={`relative h-[520px] overflow-y-auto soft-grid ${passive}`}
        onMouseMove={handlers?.onMouseMove}
        onClick={handlers?.onClick}
        onScroll={handlers?.onScroll}
        onInput={handlers?.onInput}
      >
        <main className="min-h-[960px] px-8 py-8">
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="pt-6">
              <div className="inline-flex rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-medium text-mint">Realtime workflow observability</div>
              <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.02] text-white">Launch flows that feel obvious on the first try.</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">Record friction, replay intent, and turn fuzzy product moments into precise interface fixes.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button data-replay-key="hero-cta" className={`rounded-lg bg-mint px-5 py-3 text-sm font-semibold text-ink transition hover:scale-[1.02] ${highlight("hero-cta")}`}>Start trial</button>
                <button data-replay-key="hero-docs" className={`rounded-lg border border-white/12 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.09] ${highlight("hero-docs")}`}>View docs</button>
              </div>
            </div>
            <div data-replay-key="plan-card" className={`rounded-xl border border-white/10 bg-white/[0.06] p-5 shadow-glow transition ${highlight("plan-card")}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Activation</div>
                  <div className="mt-1 text-2xl font-semibold text-white">Team rollout</div>
                </div>
                <div className="rounded-full bg-flame/15 px-3 py-1 text-xs font-semibold text-flame">Hot path</div>
              </div>
              <div className="mt-6 space-y-3">
                {["Invite engineers", "Connect staging", "Record first flow", "Share replay"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg border border-white/8 bg-black/20 p-3">
                    <div className="grid h-7 w-7 place-items-center rounded-md bg-white/10 font-mono text-xs text-slate-300">{index + 1}</div>
                    <div className="text-sm text-slate-200">{item}</div>
                    <div className="ml-auto h-2 w-16 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-mint" style={{ width: `${72 - index * 14}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ["Rage clicks", "Repeated action patterns grouped by target proximity."],
              ["Dead zones", "Unclicked screen areas with heavy pointer hesitation."],
              ["Form friction", "Typing, focus, and correction signals over time."]
            ].map(([title, text]) => (
              <article key={title} className="rounded-xl border border-white/10 bg-white/[0.045] p-5">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
              </article>
            ))}
          </section>
          <section className="mt-12 rounded-xl border border-white/10 bg-[#111722] p-6">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-mint">Request access</div>
                <h2 className="mt-3 text-3xl font-semibold text-white">Send a replay to your team.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">The recorder captures values, target hints, cursor movement, scrolling, and timestamps without shipping a heavy analytics bundle.</p>
              </div>
              <div className="space-y-4">
                <label data-replay-key="email-input" className={`block rounded-lg border border-white/10 bg-black/25 p-4 transition ${highlight("email-input")}`}>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Work email</span>
                  <input
                    className="mt-2 w-full border-0 bg-transparent text-lg text-white outline-none placeholder:text-slate-600"
                    placeholder="dev@company.io"
                    value={mode === "replay" ? inputValues["email-input"] ?? "" : undefined}
                    readOnly={mode === "replay"}
                  />
                </label>
                <button data-replay-key="submit-button" className={`w-full rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mint ${highlight("submit-button")}`}>Send replay</button>
              </div>
            </div>
          </section>
        </main>
      </div>
      {mode === "replay" && cursor?.visible ? (
        <div className="pointer-events-none absolute left-0 top-[49px] z-30 h-[520px] w-full overflow-hidden">
          <div className="absolute h-5 w-5 rounded-full border-2 border-white bg-mint shadow-[0_0_24px_rgba(93,242,196,0.9)] transition-transform" style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} />
          {click && click.x !== null && click.y !== null ? (
            <div className="absolute h-14 w-14 rounded-full border border-flame/80 bg-flame/15" style={{ transform: `translate(${click.x - 18}px, ${click.y - 18}px)`, animation: "ping 0.45s cubic-bezier(0,0,0.2,1)" }} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
