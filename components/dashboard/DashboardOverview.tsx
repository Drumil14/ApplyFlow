"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrencyRange, formatDateShort } from "@/lib/utils";
import type { Activity, Application, Resume } from "@/types/app";
import { Skeleton } from "@/components/ui/Skeleton";

const WeeklyActivityChart = dynamic(
  () => import("@/components/dashboard/WeeklyActivityChart").then((module) => module.WeeklyActivityChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />
  }
);

export function DashboardOverview({
  applications,
  resumes,
  activities
}: {
  applications: Application[];
  resumes: Resume[];
  activities: Activity[];
}) {
  const total = applications.length;
  const active = applications.filter((app) => !["REJECTED", "OFFER"].includes(app.status)).length;
  const interviews = applications.filter((app) => ["INTERVIEW", "FINAL_ROUND"].includes(app.status)).length;
  const offers = applications.filter((app) => app.status === "OFFER").length;
  const rejectionRate = total
    ? Math.round((applications.filter((app) => app.status === "REJECTED").length / total) * 100)
    : 0;
  const interviewRate = total ? Math.round((interviews / total) * 100) : 0;
  const offerRate = total ? Math.round((offers / total) * 100) : 0;

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekAdds = applications.filter((app) => new Date(app.createdAt).getTime() >= weekAgo).length;

  // Greyscale funnel — later stages read brighter.
  const stageCounts = [
    { label: "Applied", count: applications.filter((a) => a.status === "APPLIED").length, alpha: 0.28 },
    { label: "Assessment", count: applications.filter((a) => a.status === "OA").length, alpha: 0.42 },
    { label: "Interview", count: applications.filter((a) => a.status === "INTERVIEW").length, alpha: 0.58 },
    { label: "Final round", count: applications.filter((a) => a.status === "FINAL_ROUND").length, alpha: 0.74 },
    { label: "Offer", count: applications.filter((a) => a.status === "OFFER").length, alpha: 0.95 }
  ];
  const stageMax = Math.max(1, ...stageCounts.map((s) => s.count));

  const upcoming = applications
    .filter((app) => app.deadline)
    .sort((a, b) => new Date(a.deadline ?? 0).getTime() - new Date(b.deadline ?? 0).getTime())
    .slice(0, 4);

  const chartData = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const activityCount = activities.filter((activity) => {
      const created = new Date(activity.createdAt);
      return created.toDateString() === day.toDateString();
    }).length;
    const applicationCount = applications.filter((app) => {
      const updated = new Date(app.updatedAt);
      return updated.toDateString() === day.toDateString();
    }).length;
    const baseline = total ? [2, 3, 2, 4, 3, 5, 4][index] : 0;
    return { day: label, activity: Math.max(activityCount + applicationCount, baseline) };
  });

  const stats: Array<{ label: string; value: number; suffix?: string; hint: string }> = [
    { label: "Applications", value: total, hint: "Total tracked" },
    { label: "Interviews", value: interviews, hint: "Screens + onsites" },
    { label: "Offers", value: offers, hint: "Current wins" },
    { label: "Rejection rate", value: rejectionRate, suffix: "%", hint: "Signal, not identity" }
  ];

  if (!total) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState
          title="Your pipeline starts here"
          description="Add roles as you apply, attach resume versions, and move each opportunity through the board as interviews and decisions come in."
          action={
            <Link href="/dashboard/applications">
              <Button>Track first application</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader />

      {/* Hero row */}
      <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        {/* Hero — the focal anchor, strongest gradient */}
        <div className="panel-hero relative overflow-hidden rounded-2xl border border-hairline p-7 sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="eyebrow">Active pipeline</p>
              <div className="tnum mt-3 text-6xl font-semibold leading-none tracking-[-0.035em] text-content sm:text-7xl">
                <AnimatedNumber value={active} />
              </div>
              <p className="mt-4 text-sm text-content-secondary">
                {total} tracked
                <Dot />
                {interviews} in interviews
                <Dot />
                {offers} {offers === 1 ? "offer" : "offers"}
              </p>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <p className="eyebrow">This week</p>
              <div className="tnum mt-2 text-2xl font-semibold text-content">
                +<AnimatedNumber value={weekAdds} />
              </div>
              <p className="mt-1 text-xs text-content-tertiary">added</p>
            </div>
          </div>
          <div className="mt-7 h-40">
            <WeeklyActivityChart data={chartData} />
          </div>
        </div>

        {/* Right column — snapshot + conversion */}
        <div className="flex flex-col gap-4">
          <div className="panel rounded-2xl border border-hairline p-6">
            <SectionHeader title="Pipeline" hint="By stage" />
            <ul className="mt-5 space-y-3.5">
              {stageCounts.map((stage) => (
                <li key={stage.label} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs text-content-secondary">{stage.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[rgb(var(--line)/0.06)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(stage.count ? 6 : 0, (stage.count / stageMax) * 100)}%`,
                        background: `rgb(var(--text) / ${stage.alpha})`
                      }}
                    />
                  </div>
                  <span className="tnum w-5 shrink-0 text-right text-xs font-medium text-content">{stage.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel rounded-2xl border border-hairline p-6">
            <SectionHeader title="Conversion" hint="Of all applications" />
            <div className="mt-5 grid grid-cols-2 divide-x divide-hairline">
              <div className="pr-5">
                <div className="tnum text-3xl font-semibold tracking-[-0.02em] text-content">{interviewRate}%</div>
                <div className="mt-1.5 text-xs text-content-tertiary">Interview rate</div>
              </div>
              <div className="pl-5">
                <div className="tnum text-3xl font-semibold tracking-[-0.02em] text-content">{offerRate}%</div>
                <div className="mt-1.5 text-xs text-content-tertiary">Offer rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat row — hairline-divided band on a quiet gradient */}
      <section className="panel-quiet grid grid-cols-2 divide-x divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline lg:grid-cols-4 lg:divide-y-0">
        {stats.map(({ label, value, suffix, hint }) => (
          <div key={label} className="px-6 py-5">
            <div className="text-xs font-medium text-content-tertiary">{label}</div>
            <div className="tnum mt-2 text-[2rem] font-semibold leading-none tracking-[-0.02em] text-content">
              <AnimatedNumber value={value} suffix={suffix} />
            </div>
            <div className="mt-2 text-xs text-content-tertiary">{hint}</div>
          </div>
        ))}
      </section>

      {/* Lower — three fuller columns */}
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="panel rounded-2xl border border-hairline p-6">
          <SectionHeader title="Upcoming deadlines" hint="Next up" />
          {upcoming.length ? (
            <ul className="mt-2 divide-y divide-hairline">
              {upcoming.map((app) => (
                <li key={app.id} className="flex items-center justify-between gap-3 py-3.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-content">{app.company}</div>
                    <div className="mt-0.5 truncate text-xs text-content-tertiary">
                      {app.role}
                      <Dot />
                      <span className="tnum">{formatCurrencyRange(app.salaryMin, app.salaryMax)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <StatusBadge status={app.status} />
                    <span className="tnum text-xs text-content-tertiary">{formatDateShort(app.deadline)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <MiniEmpty title="No deadlines yet" description="Add OA due dates and interview times to keep urgency visible." />
          )}
        </div>

        <div className="panel rounded-2xl border border-hairline p-6">
          <SectionHeader title="Resume performance" hint="By version" />
          {resumes.length ? (
            <ul className="mt-2 divide-y divide-hairline">
              {resumes.slice(0, 4).map((resume) => (
                <li key={resume.id} className="flex items-center justify-between gap-3 py-3.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-content">{resume.title}</div>
                    <div className="mt-0.5 truncate text-xs text-content-tertiary">
                      {resume.versionTag} · {resume.targetRole}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="tnum text-sm font-semibold text-content">{Math.round(resume.score)}%</div>
                    <div className="text-xs text-content-tertiary">{resume.interviews} interviews</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <MiniEmpty title="No resumes attached" description="Upload versions to compare interview and offer conversion." />
          )}
        </div>

        <div className="panel rounded-2xl border border-hairline p-6">
          <div className="flex items-center justify-between">
            <SectionHeader title="Activity" hint="Recent" />
            <Link
              href="/dashboard/applications"
              className="inline-flex items-center gap-1 text-xs font-medium text-content-secondary transition-opacity hover:opacity-70"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {activities.length ? (
            <ol className="relative mt-5 space-y-4 pl-4">
              <span className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-hairline" aria-hidden="true" />
              {activities.slice(0, 6).map((activity) => (
                <li key={activity.id} className="relative">
                  <span
                    className="absolute -left-4 top-1.5 h-[7px] w-[7px] rounded-full bg-content-tertiary ring-4 ring-[rgb(var(--grad-to))]"
                    aria-hidden="true"
                  />
                  <div className="text-sm text-content">{activity.message}</div>
                  <div className="tnum mt-0.5 text-xs text-content-tertiary">
                    {new Date(activity.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <MiniEmpty title="No activity yet" description="Status changes, notes, interviews, and analyses land here." />
          )}
        </div>
      </section>
    </div>
  );
}

function PageHeader() {
  return (
    <header className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">Overview</p>
        <h1 className="mt-2 text-2xl font-semibold text-content sm:text-3xl">Your search, at a glance</h1>
      </div>
      <Link href="/dashboard/applications" className="shrink-0">
        <Button icon={<Plus className="h-4 w-4" />}>New application</Button>
      </Link>
    </header>
  );
}

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-sm font-semibold text-content">{title}</h2>
      {hint ? <span className="text-xs text-content-tertiary">{hint}</span> : null}
    </div>
  );
}

function Dot() {
  return <span className="mx-1.5 text-content-tertiary/50">·</span>;
}

function MiniEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-3 py-4">
      <div className="text-sm font-medium text-content">{title}</div>
      <p className="mt-1 text-xs leading-5 text-content-tertiary">{description}</p>
    </div>
  );
}
