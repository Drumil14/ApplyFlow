import type { ReactNode } from "react";

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-ink px-2 py-1 text-xs text-white opacity-0 shadow-panel transition group-hover:opacity-100 light:bg-slate-950">
        {label}
      </span>
    </span>
  );
}
