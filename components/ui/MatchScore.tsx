import { cn } from "@/lib/utils";

type MatchScoreSize = "sm" | "md";

const sizes: Record<MatchScoreSize, { box: string; value: string; unit: string }> = {
  sm: { box: "h-16 w-16", value: "text-xl", unit: "text-[0.6rem]" },
  md: { box: "h-24 w-24", value: "text-3xl", unit: "text-xs" }
};

/**
 * Circular match-score indicator. Presentational and deterministic — the same
 * score always renders the same ring. Exposes an accessible label so the number
 * isn't the only cue.
 */
export function MatchScore({
  score,
  size = "md",
  className
}: {
  score: number;
  size?: MatchScoreSize;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const s = sizes[size];
  return (
    <div
      role="img"
      aria-label={`${clamped}% match`}
      className={cn(
        "relative flex items-center justify-center rounded-full border border-accent/25 bg-accent/10",
        s.box,
        className
      )}
    >
      <span className={cn("font-semibold text-content tnum", s.value)}>{clamped}</span>
      <span className={cn("mt-4 text-content-secondary", s.unit)}>%</span>
    </div>
  );
}
