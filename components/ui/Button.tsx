import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-ink shadow-glow hover:bg-brand focus-visible:ring-brand light:bg-slate-950 light:text-white",
  secondary:
    "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1] light:border-slate-200 light:bg-white light:text-slate-950 light:hover:bg-slate-50",
  ghost: "text-slate-300 hover:bg-white/[0.07] hover:text-white light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-950",
  danger: "border border-rose/30 bg-rose/10 text-rose hover:bg-rose/15"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

export function Button({ className, variant = "primary", icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
