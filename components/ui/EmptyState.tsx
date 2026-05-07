"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      <motion.div
        className="mb-4 rounded-full border border-white/10 bg-white/[0.06] p-3 text-brand shadow-glow light:border-slate-200 light:bg-slate-50"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </motion.div>
      <h3 className="text-base font-semibold text-white light:text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400 light:text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
