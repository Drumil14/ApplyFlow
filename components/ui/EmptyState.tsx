"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";

export function EmptyState({
  title,
  description,
  action,
  icon
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
      <motion.div
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-hairline bg-surface-inset text-accent"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon ?? <Sparkles className="h-5 w-5" aria-hidden="true" />}
      </motion.div>
      <h3 className="text-lg font-semibold text-content">{title}</h3>
      <p className="mt-2 max-w-md text-base leading-6 text-content-secondary">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
