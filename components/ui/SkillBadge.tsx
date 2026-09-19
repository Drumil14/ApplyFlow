import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SkillTone = "matched" | "missing" | "neutral";

const toneStyles: Record<SkillTone, string> = {
  matched: "border-status-green/40 bg-status-green/10 text-status-green",
  missing: "border-status-rose/40 bg-status-rose/10 text-status-rose",
  neutral: "border-hairline bg-surface-inset text-content-secondary"
};

const toneIcon: Record<SkillTone, ReactNode> = {
  matched: <Check className="h-3.5 w-3.5" aria-hidden="true" />,
  missing: <X className="h-3.5 w-3.5" aria-hidden="true" />,
  neutral: null
};

/**
 * A single skill chip. Colour encodes state (matched / missing / neutral), with
 * a matching icon so the meaning isn't carried by colour alone.
 */
export function SkillBadge({
  tone = "neutral",
  icon = true,
  children,
  className
}: {
  tone?: SkillTone;
  icon?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
        toneStyles[tone],
        className
      )}
    >
      {icon ? toneIcon[tone] : null}
      {children}
    </span>
  );
}
