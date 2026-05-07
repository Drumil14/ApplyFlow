"use client";

import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-ink text-white">
        <main className="flex min-h-screen items-center justify-center px-4">
          <Card className="flex max-w-lg flex-col items-center px-6 py-12 text-center">
            <div className="mb-4 rounded-full border border-rose/25 bg-rose/10 p-3 text-rose">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold">Something went sideways</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              ApplyFlow ran into a temporary issue. Try again, or head back to the landing page.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button onClick={reset}>Retry</Button>
              <Link href="/">
                <Button variant="secondary" icon={<Home className="h-4 w-4" />}>
                  Home
                </Button>
              </Link>
            </div>
          </Card>
        </main>
      </body>
    </html>
  );
}
