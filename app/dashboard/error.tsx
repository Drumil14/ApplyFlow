"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="mx-auto flex min-h-96 max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 rounded-full border border-rose/25 bg-rose/10 p-3 text-rose">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-semibold">We could not load this workspace</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400 light:text-slate-600">
        The dashboard hit a temporary issue. Your data is still safe, and retrying usually clears it.
      </p>
      <Button className="mt-5" onClick={reset} icon={<RefreshCw className="h-4 w-4" />}>
        Try again
      </Button>
    </Card>
  );
}
