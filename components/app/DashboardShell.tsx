"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Brain, Briefcase, Columns3, FileText, Info, LogOut, Search } from "lucide-react";
import type { ReactNode } from "react";
import { CommandMenu } from "@/components/app/CommandMenu";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { ApplyFlowMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn, initials } from "@/lib/utils";
import { useCommandStore } from "@/stores/useCommandStore";

const nav = [
  { label: "Overview", href: "/dashboard", icon: BarChart3 },
  { label: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { label: "Board", href: "/dashboard/board", icon: Columns3 },
  { label: "Analyzer", href: "/dashboard/analyzer", icon: Brain },
  { label: "Resumes", href: "/dashboard/resumes", icon: FileText }
];

export function DashboardShell({
  children,
  user
}: {
  children: ReactNode;
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();
  const setOpen = useCommandStore((state) => state.setOpen);
  const isDemo = user.email === "demo@applyflow.dev";

  return (
    <div className="min-h-screen bg-ink text-white light:bg-slate-50 light:text-slate-950">
      <CommandMenu />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[#080b12]/90 px-3 py-4 backdrop-blur-xl light:border-slate-200 light:bg-white/90 lg:block">
        <Link href="/dashboard" className="mb-7 flex items-center gap-3 px-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-ink shadow-glow light:bg-slate-950 light:text-white">
            <ApplyFlowMark className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">ApplyFlow</div>
            <div className="text-xs text-slate-500">Career operating system</div>
          </div>
        </Link>
        <nav className="space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-400 outline-none transition duration-200 hover:translate-x-0.5 hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-brand/60 light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-950",
                  active && "bg-white/[0.08] text-white light:bg-slate-100 light:text-slate-950"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 light:border-slate-200 light:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand">
                {initials(user.name)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{user.name}</div>
                <div className="truncate text-xs text-slate-500">{user.email}</div>
              </div>
            </div>
            <button
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.06] hover:text-white light:border-slate-200 light:hover:bg-white light:hover:text-slate-950"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-ink/75 px-4 backdrop-blur-xl light:border-slate-200 light:bg-slate-50/80 sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/dashboard" aria-label="ApplyFlow" className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-ink light:bg-slate-950 light:text-white">
              <ApplyFlowMark className="h-5 w-5" />
            </Link>
          </div>
          <button
            className="hidden h-9 min-w-80 items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3 text-left text-sm text-slate-500 transition hover:border-white/20 hover:bg-white/[0.07] light:border-slate-200 light:bg-white light:hover:bg-slate-50 md:flex"
            onClick={() => setOpen(true)}
          >
            <Search className="h-4 w-4" />
            Search or jump to...
            <kbd className="ml-auto rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11px] light:border-slate-200 light:bg-slate-50">
              Ctrl K
            </kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button className="hidden sm:inline-flex" variant="secondary" onClick={() => setOpen(true)} icon={<Search className="h-4 w-4" />}>
              Command
            </Button>
          </div>
        </header>
        {isDemo ? (
          <div className="border-b border-brand/20 bg-brand/10 px-4 py-3 text-sm text-brand light:bg-emerald-50 sm:px-6">
            <div className="mx-auto flex max-w-7xl items-center gap-2">
              <Info className="h-4 w-4 shrink-0" />
              <span>You are viewing the demo workspace.</span>
            </div>
          </div>
        ) : null}
        <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
      </div>
      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-lg border border-white/10 bg-[#080b12]/90 p-1 shadow-panel backdrop-blur-xl light:border-slate-200 light:bg-white/90 lg:hidden" aria-label="Mobile dashboard navigation">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] text-slate-500 outline-none transition focus-visible:ring-2 focus-visible:ring-brand/60",
                active ? "bg-white/[0.08] text-brand light:bg-slate-100" : "hover:bg-white/[0.06] hover:text-white light:hover:bg-slate-100 light:hover:text-slate-950"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate px-1">{item.label === "Applications" ? "Apps" : item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
