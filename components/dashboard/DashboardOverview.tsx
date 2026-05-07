"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CalendarClock, CircleCheck, Target, TrendingUp, type LucideIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Card } from "@/components/ui/Card";
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
  const active = applications.filter((app) => !["REJECTED", "OFFER"].includes(app.status)).length;
  const interviews = applications.filter((app) => ["INTERVIEW", "FINAL_ROUND"].includes(app.status)).length;
  const offers = applications.filter((app) => app.status === "OFFER").length;
  const rejectionRate = applications.length
    ? Math.round((applications.filter((app) => app.status === "REJECTED").length / applications.length) * 100)
    : 0;

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
    const baseline = applications.length ? [2, 3, 2, 4, 3, 5, 4][index] : 0;
    return { day: label, activity: Math.max(activityCount + applicationCount, baseline) };
  });
  const statCards: Array<{ label: string; value: number; suffix?: string; icon: LucideIcon; hint: string }> = [
    { label: "Active applications", value: active, icon: Target, hint: "Across live roles" },
    { label: "Interview loops", value: interviews, icon: CalendarClock, hint: "Screens and onsites" },
    { label: "Offers", value: offers, icon: CircleCheck, hint: "Current wins" },
    { label: "Rejection rate", value: rejectionRate, suffix: "%", icon: TrendingUp, hint: "Useful signal, not identity" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-brand">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-white light:text-slate-950 sm:text-4xl">
            Your search, at a glance
          </h1>
          <p className="mt-2 text-sm text-slate-400 light:text-slate-600">
            Track momentum, deadlines, and conversion signals without losing the story.
          </p>
        </div>
        <Link href="/dashboard/applications">
          <Button icon={<ArrowUpRight className="h-4 w-4" />}>New application</Button>
        </Link>
      </div>

      {!applications.length ? (
        <EmptyState
          title="Your demo-ready pipeline starts here"
          description="Add roles as you apply, attach resume versions, and move each opportunity through the board as interviews and decisions come in."
          action={
            <Link href="/dashboard/applications">
              <Button>Track first application</Button>
            </Link>
          }
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, suffix, icon: Icon, hint }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <Card className="p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] light:hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400 light:text-slate-600">{label}</div>
                <Icon className="h-4 w-4 text-brand" />
              </div>
              <div className="mt-4 text-3xl font-semibold">
                <AnimatedNumber value={value} suffix={suffix} />
              </div>
              <div className="mt-1 text-xs text-slate-500">{hint}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Weekly activity</h2>
              <p className="mt-1 text-sm text-slate-500">Status changes, notes, and updates.</p>
            </div>
          </div>
          <div className="h-72">
            <WeeklyActivityChart data={chartData} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Upcoming deadlines</h2>
          <div className="mt-4 space-y-3">
            {upcoming.length ? upcoming.map((app) => (
              <div key={app.id} className="rounded-md border border-white/10 bg-white/[0.035] p-3 light:border-slate-200 light:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{app.company}</div>
                    <div className="truncate text-xs text-slate-500">{app.role}</div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="mt-3 text-xs text-slate-400 light:text-slate-600">
                  {formatDateShort(app.deadline)}
                  <span className="mx-2 text-slate-600">-</span>
                  {formatCurrencyRange(app.salaryMin, app.salaryMax)}
                </div>
              </div>
            )) : (
              <MiniEmpty title="No deadlines yet" description="Add OA due dates, interview times, and offer deadlines to keep urgency visible." />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-5">
          <h2 className="font-semibold">Resume performance</h2>
          <div className="mt-4 space-y-3">
            {resumes.length ? resumes.slice(0, 4).map((resume) => (
              <div key={resume.id} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.035] p-3 light:border-slate-200 light:bg-slate-50">
                <div>
                  <div className="text-sm font-medium">{resume.title}</div>
                  <div className="text-xs text-slate-500">{resume.versionTag} - {resume.targetRole}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-brand">{Math.round(resume.score)}%</div>
                  <div className="text-xs text-slate-500">{resume.interviews} interviews</div>
                </div>
              </div>
            )) : (
              <MiniEmpty title="No resumes attached" description="Upload versions to compare interview and offer conversion." />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Activity timeline</h2>
          <div className="mt-5 space-y-4">
            {activities.length ? activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-brand shadow-glow" />
                <div>
                  <div className="text-sm text-slate-200 light:text-slate-800">{activity.message}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {new Date(activity.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            )) : (
              <MiniEmpty title="No activity yet" description="ApplyFlow will log status changes, notes, interviews, and AI analyses here." />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-dashed border-white/10 bg-white/[0.025] p-4 text-sm light:border-slate-200 light:bg-slate-50">
      <div className="font-medium text-slate-300 light:text-slate-800">{title}</div>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}
