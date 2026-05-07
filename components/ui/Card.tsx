import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.045] shadow-panel backdrop-blur-xl light:border-slate-200 light:bg-white light:shadow-sm",
        className
      )}
      {...props}
    />
  );
}
