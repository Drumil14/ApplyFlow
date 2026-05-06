import type { Insight } from "@/lib/types";

type InsightsPanelProps = {
  insights: Insight[];
};

const tones: Record<Insight["tone"], string> = {
  mint: "border-mint/30 bg-mint/10 text-mint",
  flame: "border-flame/30 bg-flame/10 text-flame",
  sky: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
  violet: "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-200"
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <section className="rounded-xl border border-mint/20 bg-gradient-to-br from-mint/12 via-white/[0.04] to-flame/10 p-5 shadow-glow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-mint">Insights Engine</div>
          <h2 className="mt-2 text-xl font-semibold text-white">Behavioral Signals</h2>
        </div>
        <div className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1 font-mono text-xs text-mint">AI-ready</div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((insight) => (
          <article key={insight.label} className={`rounded-lg border p-4 ${tones[insight.tone]}`}>
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">{insight.label}</div>
            <div className="mt-2 text-sm font-medium leading-6 text-slate-100">{insight.value}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
