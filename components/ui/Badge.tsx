import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Each pipeline stage maps to one status hue (color is information, not decoration). */
const statusColor: Record<string, string> = {
  APPLIED: "text-status-neutral",
  OA: "text-status-amber",
  INTERVIEW: "text-status-blue",
  FINAL_ROUND: "text-status-violet",
  OFFER: "text-status-green",
  REJECTED: "text-status-rose"
};

const statusLabel: Record<string, string> = {
  APPLIED: "Applied",
  OA: "Assessment",
  INTERVIEW: "Interview",
  FINAL_ROUND: "Final round",
  OFFER: "Offer",
  REJECTED: "Rejected"
};

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border border-hairline bg-surface-inset px-2.5 text-xs font-medium text-content-secondary",
        className
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusColor[status] ?? "text-content-secondary";
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border border-hairline bg-surface-inset px-2.5 text-xs font-medium text-content-secondary",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", tone)} aria-hidden="true" />
      {statusLabel[status] ?? status.toLowerCase().replace(/_/g, " ")}
    </span>
  );
}
