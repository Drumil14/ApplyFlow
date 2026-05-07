import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 text-white light:bg-slate-50 light:text-slate-950">
      <Card className="flex max-w-lg flex-col items-center px-6 py-12 text-center">
        <div className="mb-4 text-sm font-medium text-brand">404</div>
        <h1 className="text-2xl font-semibold">This page is not in the pipeline</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400 light:text-slate-600">
          The link may have moved, or the workspace route may no longer exist.
        </p>
        <Link className="mt-6" href="/">
          <Button icon={<Home className="h-4 w-4" />}>Back home</Button>
        </Link>
      </Card>
    </main>
  );
}
