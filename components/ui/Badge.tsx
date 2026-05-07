import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  APPLIED: "border-slate-400/20 bg-slate-400/10 text-slate-200 light:text-slate-700",
  OA: "border-amber/30 bg-amber/10 text-amber",
  INTERVIEW: "border-brand/30 bg-brand/10 text-brand",
  FINAL_ROUND: "border-violet/30 bg-violet/10 text-violet",
  OFFER: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 light:text-emerald-700",
  REJECTED: "border-rose/30 bg-rose/10 text-rose"
};

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border border-white/10 bg-white/[0.06] px-2.5 text-xs font-medium text-slate-300",
        className
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={cn(statusTone[status], "capitalize")}>{status.toLowerCase().replace("_", " ")}</Badge>;
}
