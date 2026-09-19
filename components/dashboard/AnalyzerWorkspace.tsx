"use client";

import { motion } from "framer-motion";
import { AlertTriangle, FileText, Loader2, Plus, ScanSearch, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useAnalyzeJob } from "@/hooks/use-analysis";
import { useResumes } from "@/hooks/use-resumes";
import { AddResumeDialog } from "@/components/dashboard/AddResumeDialog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MatchScore } from "@/components/ui/MatchScore";
import { Skeleton } from "@/components/ui/Skeleton";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AnalysisResult, Resume } from "@/types/app";

const sample =
  "About the role: As a Product Engineer on our Growth Platform team, you will build polished React and TypeScript surfaces used by thousands of teams, own API integrations in Node.js, and partner closely with design, data, and product. You will improve activation funnels, ship accessible UI, instrument experiments, and work with PostgreSQL, observability tooling, feature flags, and modern CI/CD. Strong candidates have shipped full-stack projects, can explain product tradeoffs, and write clearly about impact.";

export function AnalyzerWorkspace({ initialResumes }: { initialResumes: Resume[] }) {
  const { data: resumes = [] } = useResumes(initialResumes);
  const [description, setDescription] = useState("");
  const [resumeId, setResumeId] = useState(initialResumes[0]?.id ?? "");
  const [addOpen, setAddOpen] = useState(false);
  const analyzeJob = useAnalyzeJob();

  // After creating a resume, the query cache already holds it (useCreateResume);
  // select it so the user can analyze immediately with no refresh.
  const onResumeCreated = (resume: Resume) => setResumeId(resume.id);

  const result: AnalysisResult | null = analyzeJob.data ?? null;
  const loading = analyzeJob.isPending;
  const error = analyzeJob.error ? analyzeJob.error.message : "";

  const analyze = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    analyzeJob.mutate(
      { resumeId, jobDescription: description },
      {
        onSuccess: () => toast.success("Job description analyzed"),
        onError: (err) => toast.error(err.message || "Could not analyze this role.")
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand">Match analyzer</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Score a role against your resume</h1>
        <p className="mt-2 text-sm text-content-secondary">
          A transparent, deterministic skill match — plus optional AI insights when a model is configured. Pick a resume
          version and paste a job description.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <form onSubmit={analyze}>
            <div className="mb-3">
              <div className="mb-2 flex items-center justify-between">
                <label id="resumeId-label" htmlFor="resumeId" className="block text-sm font-medium">
                  Resume version
                </label>
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent outline-none transition-colors hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add resume
                </button>
              </div>
              {resumes.length ? (
                <Select
                  id="resumeId"
                  aria-labelledby="resumeId-label"
                  value={resumeId}
                  onChange={setResumeId}
                  options={resumes.map((resume) => ({
                    value: resume.id,
                    label: `${resume.title} · ${resume.versionTag} (${resume.skills?.length ?? 0} skills)`
                  }))}
                />
              ) : (
                <div className="flex items-center gap-2 rounded-md border border-amber/25 bg-amber/10 p-3 text-sm text-amber">
                  <FileText className="h-4 w-4 shrink-0" />
                  Add a resume version first so it has skills to match against.
                </div>
              )}
            </div>

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
              className="min-h-[24rem]"
              placeholder="Paste the full job description here..."
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Button
              className="mt-4 w-full"
              disabled={loading || !resumes.length}
              icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
            >
              Analyze match
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
              <div className="rounded-full border border-status-rose/30 bg-status-rose/10 p-4 text-status-rose">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">Analysis needs another pass</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-content-secondary">{error}</p>
              <Button className="mt-5" variant="secondary" onClick={() => analyzeJob.reset()}>
                Try again
              </Button>
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Role match</h2>
                  <p className="mt-1 text-sm text-content-secondary">
                    {result.matched.length} of {result.requiredSkills.length} required skills present · {result.seniorityLevel} signal
                  </p>
                </div>
                <MatchScore score={result.matchScore} />
              </div>

              <SkillList
                title="Matched"
                items={result.matched}
                tone="matched"
                empty="No overlap yet — this resume version shares none of the job's skills."
              />
              <SkillList
                title="Missing"
                items={result.missing}
                tone="missing"
                empty="Nothing missing — this resume covers every skill in the job description."
              />

              {result.resumeSuggestions.length ? (
                <div>
                  <h3 className="mb-3 text-sm font-medium">Resume suggestions</h3>
                  <div className="space-y-2">
                    {result.resumeSuggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        className="rounded-md border border-hairline bg-surface-inset p-3 text-sm leading-6 text-content-secondary"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <AIInsights result={result} />
            </motion.div>
          ) : (
            <div className="flex min-h-[34rem] flex-col items-center justify-center text-center">
              <div className="rounded-full border border-hairline bg-surface-inset p-4 text-accent">
                <ScanSearch className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">Ready when you paste a role</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-content-secondary">
                ApplyFlow compares the job&apos;s skills against your selected resume version and shows exactly what matches and what&apos;s missing.
              </p>
            </div>
          )}
        </Card>
      </div>

      <AddResumeDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={onResumeCreated} />
    </div>
  );
}

function AIInsights({ result }: { result: AnalysisResult }) {
  const { ai, aiStatus } = result;

  if (aiStatus !== "ok" || !ai) {
    const message =
      aiStatus === "failed"
        ? "AI insights are temporarily unavailable. Your deterministic match above is fully accurate."
        : "AI insights aren't configured. Add an API key to enable qualitative analysis — the deterministic match above works either way.";
    return (
      <section aria-labelledby="ai-insights-heading" className="border-t border-hairline pt-6">
        <div className="flex items-start gap-3 rounded-lg border border-hairline bg-surface-inset p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-content-tertiary" aria-hidden="true" />
          <div>
            <h3 id="ai-insights-heading" className="text-sm font-medium text-content">
              AI insights
            </h3>
            <p className="mt-1 text-sm text-content-secondary">{message}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="ai-insights-heading" className="space-y-5 border-t border-hairline pt-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
        <h3 id="ai-insights-heading" className="text-sm font-medium">
          AI insights
        </h3>
        <span className="text-xs text-content-tertiary">
          {ai.roleTitle} · {ai.seniority}
        </span>
      </div>

      <p className="rounded-lg border border-hairline border-l-2 border-l-accent/60 bg-surface-inset p-4 text-sm leading-6 text-content-secondary">
        {ai.summary}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <AIList title="Strengths" items={ai.strengths} tone="positive" />
        <AIList title="Gaps" items={ai.gaps} tone="negative" />
      </div>

      <AIBlock title="Main responsibilities" items={ai.responsibilities} />
      <AIBlock title="Resume opportunities" items={ai.resumeSuggestions} />
      <AIBlock title="Interview topics" items={ai.interviewTopics} chips />
    </section>
  );
}

function AIList({ title, items, tone }: { title: string; items: string[]; tone: "positive" | "negative" }) {
  if (!items.length) return null;
  const dot = tone === "positive" ? "bg-status-green" : "bg-status-rose";
  return (
    <div>
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-content-tertiary">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-content-secondary">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AIBlock({ title, items, chips = false }: { title: string; items: string[]; chips?: boolean }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-content-tertiary">{title}</h4>
      {chips ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full border border-hairline bg-surface-inset px-3 py-1 text-sm text-content-secondary"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="rounded-md border border-hairline bg-surface-inset p-3 text-sm leading-6 text-content-secondary">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SkillList({
  title,
  items,
  tone,
  empty
}: {
  title: string;
  items: string[];
  tone: "matched" | "missing";
  empty: string;
}) {
  const matched = tone === "matched";
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <span className={matched ? "text-status-green" : "text-status-rose"}>{title}</span>
        <span className="text-xs text-content-tertiary">({items.length})</span>
      </h3>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <SkillBadge key={item} tone={matched ? "matched" : "missing"}>
              {item}
            </SkillBadge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-content-tertiary">{empty}</p>
      )}
    </div>
  );
}
