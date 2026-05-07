"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Brain, Briefcase, Columns3, FileText, Home, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCommandStore } from "@/stores/useCommandStore";

const commands = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { label: "Kanban board", href: "/dashboard/board", icon: Columns3 },
  { label: "AI analyzer", href: "/dashboard/analyzer", icon: Brain },
  { label: "Resume versions", href: "/dashboard/resumes", icon: FileText },
  { label: "Analytics", href: "/dashboard", icon: BarChart3 }
];

export function CommandMenu() {
  const { open, setOpen, toggle } = useCommandStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const filtered = useMemo(
    () => commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
      if (event.key === "Escape") setOpen(false);
      if (!open) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((current) => Math.min(current + 1, filtered.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelected((current) => Math.max(current - 1, 0));
      }
      if (event.key === "Enter" && filtered[selected]) {
        event.preventDefault();
        router.push(filtered[selected].href);
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, open, router, selected, setOpen, toggle]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => setOpen(false)}
        >
          <motion.div
            className="mx-auto mt-24 max-w-xl overflow-hidden rounded-lg border border-white/10 bg-[#0b0f17]/95 shadow-panel light:border-slate-200 light:bg-white"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 light:border-slate-200">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search commands..."
                className="h-9 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 light:text-slate-950"
              />
              <button
                className="rounded-md p-1 text-slate-500 transition hover:bg-white/10 hover:text-white light:hover:bg-slate-100 light:hover:text-slate-950"
                onClick={() => setOpen(false)}
                aria-label="Close command menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2" role="listbox" aria-label="Command results">
              {filtered.length ? filtered.map((command, index) => {
                const Icon = command.icon;
                return (
                  <Link
                    key={command.href + command.label}
                    href={command.href}
                    onClick={() => setOpen(false)}
                    role="option"
                    aria-selected={selected === index}
                    className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm transition ${
                      selected === index
                        ? "bg-white/[0.08] text-white light:bg-slate-100 light:text-slate-950"
                        : "text-slate-300 hover:bg-white/[0.07] hover:text-white light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-950"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{command.label}</span>
                    <span className="ml-auto text-xs text-slate-600">{index === selected ? "Enter" : ""}</span>
                  </Link>
                );
              }) : (
                <div className="px-3 py-8 text-center text-sm text-slate-500">
                  No command found. Try board, resume, or analyzer.
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-slate-500 light:border-slate-200">
              <span>Quick navigation</span>
              <kbd className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono light:border-slate-200 light:bg-slate-50">
                Ctrl K
              </kbd>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
