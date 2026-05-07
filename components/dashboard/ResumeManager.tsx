"use client";

import { motion } from "framer-motion";
import { FileText, Loader2, Plus, Trophy } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import type { Resume } from "@/types/app";

export function ResumeManager({ initialResumes }: { initialResumes: Resume[] }) {
  const [resumes, setResumes] = useState(initialResumes);
  const [loading, setLoading] = useState(false);

  const best = useMemo(() => [...resumes].sort((a, b) => b.score - a.score)[0], [resumes]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          versionTag: form.get("versionTag"),
          fileName: form.get("fileName"),
          targetRole: form.get("targetRole")
        })
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Could not add resume.");
      if (!data?.resume) throw new Error("Could not add resume.");
      setResumes((current) => [data.resume, ...current]);
      toast.success("Resume version added");
      event.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand">Resumes</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Resume version tracking</h1>
        <p className="mt-2 text-sm text-slate-400 light:text-slate-600">Associate versions with applications and watch which positioning performs.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-5">
          <h2 className="font-semibold">Add version</h2>
          <form className="mt-5 space-y-4" onSubmit={submit}>
            <label className="block text-sm">Title<Input className="mt-2" name="title" placeholder="Backend Systems Resume" required /></label>
            <label className="block text-sm">Version tag<Input className="mt-2" name="versionTag" placeholder="v3" required /></label>
            <label className="block text-sm">File name<Input className="mt-2" name="fileName" placeholder="resume-backend-v3.pdf" required /></label>
            <label className="block text-sm">Target role<Input className="mt-2" name="targetRole" placeholder="Backend Engineer" /></label>
            <Button className="w-full" disabled={loading} icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}>Add resume</Button>
          </form>
          {best ? (
            <div className="mt-6 rounded-lg border border-brand/20 bg-brand/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-brand">
                <Trophy className="h-4 w-4" />
                Best performer
              </div>
              <div className="mt-3 text-sm text-slate-200 light:text-slate-800">{best.title} has the strongest conversion score.</div>
            </div>
          ) : null}
        </Card>

        {resumes.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {resumes.map((resume, index) => (
              <motion.div key={resume.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Card className="p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] light:hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-brand light:border-slate-200 light:bg-slate-50">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{resume.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">{resume.fileName}</p>
                      </div>
                    </div>
                    <Badge>{resume.versionTag}</Badge>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      ["Score", `${Math.round(resume.score)}%`],
                      ["Interviews", resume.interviews],
                      ["Offers", resume.offers]
                    ].map(([label, value]) => (
                      <div key={label as string} className="rounded-md border border-white/10 bg-white/[0.035] p-3 light:border-slate-200 light:bg-slate-50">
                        <div className="text-xs text-slate-500">{label as string}</div>
                        <div className="mt-1 font-semibold">{value as string}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Associated applications</div>
                    <div className="space-y-2">
                      {(resume.applications ?? []).slice(0, 3).map((app) => (
                        <div key={app.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] p-2 light:border-slate-200 light:bg-slate-50">
                          <div className="min-w-0">
                            <div className="truncate text-sm">{app.company}</div>
                            <div className="truncate text-xs text-slate-500">{app.role}</div>
                          </div>
                          <StatusBadge status={app.status} />
                        </div>
                      ))}
                      {!(resume.applications ?? []).length ? <div className="text-sm text-slate-500">No associated applications yet.</div> : null}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState title="No resume versions yet" description="Add the versions you are sending so ApplyFlow can track which positioning works." />
        )}
      </div>
    </div>
  );
}
