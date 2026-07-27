"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Brain, Briefcase, Columns3, FileText, LogOut, Search } from "lucide-react";
import type { ReactNode } from "react";
import { CommandMenu } from "@/components/app/CommandMenu";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { ApplyFlowMark } from "@/components/brand/Logo";
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
  const displayName = user.name ?? "Your workspace";

  return (
    <div className="min-h-screen bg-canvas text-content">
      <CommandMenu />

      {/* Sidebar — the heaviest structural material (§12) */}
      <aside className="material fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-hairline px-3 py-5 lg:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-fg shadow-sm">
            <ApplyFlowMark className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-md font-semibold tracking-[-0.01em]">ApplyFlow</div>
            <div className="text-xs text-content-tertiary">Career workspace</div>
          </div>
        </Link>

        <nav className="space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50",
                  active
                    ? "bg-surface-inset text-content"
                    : "text-content-secondary hover:bg-surface-inset hover:text-content"
                )}
              >
                {active ? (
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent" aria-hidden="true" />
                ) : null}
                <Icon className={cn("h-4 w-4", active ? "text-accent" : "text-content-tertiary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-hairline bg-surface-inset p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
              {initials(displayName)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{displayName}</div>
              <div className="truncate text-xs text-content-tertiary">Personal workspace</div>
            </div>
          </div>
          <button
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-hairline px-3 py-2 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Header — translucent chrome; content scrolls under it */}
        <header className="material sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-hairline px-4 sm:px-6">
          <Link
            href="/dashboard"
            aria-label="ApplyFlow"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-fg lg:hidden"
          >
            <ApplyFlowMark className="h-5 w-5" />
          </Link>

          <button
            className="hidden h-9 w-full max-w-md items-center gap-2.5 rounded-md border border-hairline bg-surface-inset px-3 text-left text-sm text-content-tertiary transition-colors hover:border-hairline-strong hover:text-content-secondary md:flex"
            onClick={() => setOpen(true)}
          >
            <Search className="h-4 w-4" />
            Search or jump to…
            <kbd className="ml-auto rounded border border-hairline bg-surface px-1.5 py-0.5 font-mono text-2xs text-content-tertiary">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface-inset text-content-secondary transition-colors hover:bg-surface-hover hover:text-content md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1800px] px-5 pb-28 pt-8 sm:px-8 xl:px-10 lg:pb-14">{children}</main>
      </div>

      {/* Mobile nav — floating material bar */}
      <nav
        className="material-strong fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-xl border border-hairline p-1 shadow-lg lg:hidden"
        aria-label="Mobile dashboard navigation"
      >
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
                "flex h-12 flex-col items-center justify-center gap-1 rounded-lg text-2xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50",
                active
                  ? "bg-surface-inset text-accent"
                  : "text-content-tertiary hover:bg-surface-inset hover:text-content"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate px-1">
                {item.label === "Applications" ? "Apps" : item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
