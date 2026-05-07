"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Brain, Loader2, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Input";
import type { AnalysisResult } from "@/types/app";

const sample =
  "About the role: As a Product Engineer on our Growth Platform team, you will build polished React and TypeScript surfaces used by thousands of teams, own API integrations in Node.js, and partner closely with design, data, and product. You will improve activation funnels, ship accessible UI, instrument experiments, and work with PostgreSQL, observability tooling, feature flags, and modern CI/CD. Strong candidates have shipped full-stack projects, can explain product tradeoffs, and write clearly about impact.";

export function AnalyzerWorkspace() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const analyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Analysis failed.");
      if (!data?.analysis) throw new Error("Analysis failed.");
      setResult(data.analysis);
      toast.success("Job description analyzed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not analyze this role.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand">AI analyzer</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Decode a job description</h1>
        <p className="mt-2 text-sm text-slate-400 light:text-slate-600">Extract hiring signals and turn them into focused resume edits.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <form onSubmit={analyze}>
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="description" className="text-sm font-medium">Job description</label>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-brand transition hover:bg-brand/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                onClick={() => setDescription(sample)}
              >
                Insert sample
              </button>
            </div>
            <Textarea
              id="description"
              name="description"
              className="min-h-[28rem]"
              placeholder="Paste the full job description here..."
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Button className="mt-4 w-full" disabled={loading} icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}>
              Analyze role
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          {loading ? (
            <div className="space-y-5">
              <Skeleton className="h-28" />
              <Skeleton className="h-20" />
              <Skeleton className="h-36" />
            </div>
          ) : error ? (
            <div className="flex min-h-[34rem] flex-col items-center justify-center text-center">
              <div className="rounded-full border border-rose/25 bg-rose/10 p-4 text-rose">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">Analysis needs another pass</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{error}</p>
              <Button className="mt-5" variant="secondary" onClick={() => setError("")}>
                Try again
              </Button>
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Role match</h2>
                  <p className="mt-1 text-sm text-slate-500">{result.seniorityLevel} signal</p>
                </div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-brand/25 bg-brand/10">
                  <span className="text-3xl font-semibold text-brand">{result.matchScore}</span>
                  <span className="mt-7 text-xs text-brand">%</span>
                </div>
              </div>
              <Section title="Required skills" items={result.requiredSkills} />
              <Section title="Technologies" items={result.technologies} />
              <Section title="Keywords" items={result.keywords} />
              <div>
                <h3 className="mb-3 text-sm font-medium">Resume suggestions</h3>
                <div className="space-y-3">
                  {result.resumeSuggestions.map((suggestion) => (
                    <div key={suggestion} className="flex gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-slate-300 light:border-slate-200 light:bg-slate-50 light:text-slate-700">
                      <Sparkles className="mt-1 h-4 w-4 shrink-0 text-brand" />
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex min-h-[34rem] flex-col items-center justify-center text-center">
              <div className="rounded-full border border-white/10 bg-white/[0.06] p-4 text-brand light:border-slate-200 light:bg-slate-50">
                <Brain className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">Ready when you paste a role</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                ApplyFlow will return structured skills, technologies, keywords, seniority, and resume changes.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </div>
    </div>
  );
}
