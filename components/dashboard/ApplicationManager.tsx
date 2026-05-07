"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, LinkIcon, Loader2, Plus, Trash2, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Textarea } from "@/components/ui/Input";
import { formatCurrencyRange, formatDateShort } from "@/lib/utils";
import type { Application, Resume, Status } from "@/types/app";
import { statuses, statusLabels } from "@/types/app";

type FormState = {
  company: string;
  role: string;
  status: Status;
  location: string;
  workMode: string;
  salaryMin: string;
  salaryMax: string;
  deadline: string;
  recruiterName: string;
  recruiterEmail: string;
  notes: string;
  links: string;
  resumeId: string;
};

const blank: FormState = {
  company: "",
  role: "",
  status: "APPLIED",
  location: "",
  workMode: "Hybrid",
  salaryMin: "",
  salaryMax: "",
  deadline: "",
  recruiterName: "",
  recruiterEmail: "",
  notes: "",
  links: "",
  resumeId: ""
};

export function ApplicationManager({
  initialApplications,
  resumes
}: {
  initialApplications: Application[];
  resumes: Resume[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [editing, setEditing] = useState<Application | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const counts = useMemo(
    () => statuses.map((status) => ({ status, count: applications.filter((app) => app.status === status).length })),
    [applications]
  );

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const remove = async (application: Application) => {
    setApplications((current) => current.filter((item) => item.id !== application.id));
    try {
      const response = await fetch(`/api/applications/${application.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete application.");
      toast.success(`${application.company} removed`);
    } catch {
      setApplications((current) => [application, ...current]);
      toast.error("Could not delete application.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-brand">Applications</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Job application management</h1>
          <p className="mt-2 text-sm text-slate-400 light:text-slate-600">Create, edit, annotate, and associate every role with the resume that carried it.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreate} icon={<Plus className="h-4 w-4" />}>Add application</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {counts.map((item) => (
          <Badge key={item.status} className="h-8 shrink-0 gap-2">
            {statusLabels[item.status]} <span className="text-slate-500">{item.count}</span>
          </Badge>
        ))}
      </div>

      {applications.length ? (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.5fr] gap-4 border-b border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 light:border-slate-200 md:grid">
            <div>Role</div>
            <div>Status</div>
            <div>Deadline</div>
            <div>Compensation</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-white/10 light:divide-slate-200">
            {applications.map((application) => (
              <motion.div
                key={application.id}
                layout
                className="grid gap-4 px-5 py-4 transition duration-200 hover:bg-white/[0.035] light:hover:bg-slate-50 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.5fr] md:items-center"
              >
                <button className="rounded-md text-left outline-none transition focus-visible:ring-2 focus-visible:ring-brand/60" onClick={() => { setEditing(application); setOpen(true); }}>
                  <div className="font-medium">{application.company}</div>
                  <div className="mt-1 text-sm text-slate-500">{application.role}</div>
                </button>
                <div className="flex items-center gap-2 md:block">
                  <span className="text-xs uppercase tracking-wider text-slate-600 md:hidden">Status</span>
                  <StatusBadge status={application.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 light:text-slate-600">
                  <Calendar className="h-4 w-4" />
                  {formatDateShort(application.deadline)}
                </div>
                <div className="text-sm text-slate-400 light:text-slate-600">{formatCurrencyRange(application.salaryMin, application.salaryMax)}</div>
                <div className="flex justify-end gap-2">
                  {application.links?.[0] ? (
                    <a className="rounded-md p-2 text-slate-500 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 light:hover:bg-slate-100 light:hover:text-slate-950" href={application.links[0]} target="_blank" rel="noreferrer" aria-label="Open application link">
                      <LinkIcon className="h-4 w-4" />
                    </a>
                  ) : null}
                  <button className="rounded-md p-2 text-slate-500 transition hover:bg-rose/10 hover:text-rose focus:outline-none focus-visible:ring-2 focus-visible:ring-rose/60" onClick={() => remove(application)} aria-label="Delete application">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState title="No applications yet" description="Add your first role, then use the board and timeline to keep the search moving." action={<Button onClick={openCreate}>Add application</Button>} />
      )}

      <ApplicationModal
        open={open}
        application={editing}
        resumes={resumes}
        loading={loading}
        onClose={() => setOpen(false)}
        onSubmit={async (payload) => {
          setLoading(true);
          try {
            const response = await fetch(editing ? `/api/applications/${editing.id}` : "/api/applications", {
              method: editing ? "PATCH" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) throw new Error(data?.message ?? "Application could not be saved.");
            if (!data?.application) throw new Error("Application could not be saved.");
            setApplications((current) =>
              editing
                ? current.map((app) => (app.id === data.application.id ? data.application : app))
                : [data.application, ...current]
            );
            toast.success(editing ? "Application updated" : "Application created");
            setOpen(false);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong.");
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}

function ApplicationModal({
  open,
  application,
  resumes,
  loading,
  onClose,
  onSubmit
}: {
  open: boolean;
  application: Application | null;
  resumes: Resume[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const values: FormState = application
    ? {
        company: application.company,
        role: application.role,
        status: application.status,
        location: application.location ?? "",
        workMode: application.workMode ?? "Hybrid",
        salaryMin: String(application.salaryMin ?? ""),
        salaryMax: String(application.salaryMax ?? ""),
        deadline: application.deadline ? application.deadline.slice(0, 10) : "",
        recruiterName: application.recruiterName ?? "",
        recruiterEmail: application.recruiterEmail ?? "",
        notes: application.notes ?? "",
        links: application.links.join(", "),
        resumeId: application.resumeId ?? ""
      }
    : blank;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      company: form.get("company"),
      role: form.get("role"),
      status: form.get("status"),
      location: form.get("location"),
      workMode: form.get("workMode"),
      salaryMin: form.get("salaryMin"),
      salaryMax: form.get("salaryMax"),
      deadline: form.get("deadline"),
      recruiterName: form.get("recruiterName"),
      recruiterEmail: form.get("recruiterEmail"),
      notes: form.get("notes"),
      resumeId: form.get("resumeId"),
      links: String(form.get("links") ?? "")
        .split(",")
        .map((link) => link.trim())
        .filter(Boolean)
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-modal-title"
            className="mx-auto my-8 max-w-2xl rounded-lg border border-white/10 bg-[#0b0f17] p-5 shadow-panel light:border-slate-200 light:bg-white"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 id="application-modal-title" className="text-xl font-semibold">{application ? "Edit application" : "Add application"}</h2>
                <p className="mt-1 text-sm text-slate-500">Keep notes specific enough that future you can act quickly.</p>
              </div>
              <button className="rounded-md p-2 text-slate-500 transition hover:bg-white/10 hover:text-white light:hover:bg-slate-100 light:hover:text-slate-950" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
              <label className="text-sm">Company<Input className="mt-2" name="company" defaultValue={values.company} required /></label>
              <label className="text-sm">Role<Input className="mt-2" name="role" defaultValue={values.role} required /></label>
              <label className="text-sm">Status<select name="status" defaultValue={values.status} className="mt-2 h-10 w-full rounded-md border border-white/10 bg-[#111724] px-3 text-sm outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/15 light:border-slate-200 light:bg-white">{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
              <label className="text-sm">Resume<select name="resumeId" defaultValue={values.resumeId} className="mt-2 h-10 w-full rounded-md border border-white/10 bg-[#111724] px-3 text-sm outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/15 light:border-slate-200 light:bg-white"><option value="">No resume</option>{resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.title} {resume.versionTag}</option>)}</select></label>
              <label className="text-sm">Location<Input className="mt-2" name="location" defaultValue={values.location} /></label>
              <label className="text-sm">Work mode<Input className="mt-2" name="workMode" defaultValue={values.workMode} /></label>
              <label className="text-sm">Salary min<Input className="mt-2" name="salaryMin" type="number" defaultValue={values.salaryMin} /></label>
              <label className="text-sm">Salary max<Input className="mt-2" name="salaryMax" type="number" defaultValue={values.salaryMax} /></label>
              <label className="text-sm">Deadline<Input className="mt-2" name="deadline" type="date" defaultValue={values.deadline} /></label>
              <label className="text-sm">Recruiter<Input className="mt-2" name="recruiterName" defaultValue={values.recruiterName} /></label>
              <label className="text-sm sm:col-span-2">Recruiter email<Input className="mt-2" name="recruiterEmail" type="email" defaultValue={values.recruiterEmail} /></label>
              <label className="text-sm sm:col-span-2">Links<Input className="mt-2" name="links" defaultValue={values.links} placeholder="https://company.com/jobs, https://linkedin.com/..." /></label>
              <label className="text-sm sm:col-span-2">Notes<Textarea className="mt-2" name="notes" defaultValue={values.notes} /></label>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button disabled={loading} icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}>{application ? "Save changes" : "Create application"}</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
