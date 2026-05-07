import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand/60 focus:ring-2 focus:ring-brand/15 light:border-slate-200 light:bg-white light:text-slate-950",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-none rounded-md border border-white/10 bg-white/[0.055] px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand/60 focus:ring-2 focus:ring-brand/15 light:border-slate-200 light:bg-white light:text-slate-950",
        className
      )}
      {...props}
    />
  );
}
