import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Adds hover affordance for cards that act as links/buttons. */
  interactive?: boolean;
};

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "panel rounded-xl border border-hairline",
        interactive && "transition-colors duration-200 hover:border-hairline-strong",
        className
      )}
      {...props}
    />
  );
}
