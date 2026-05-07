"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Tooltip } from "@/components/ui/Tooltip";

export function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    setTheme(window.localStorage.getItem("applyflow-theme") ?? "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem("applyflow-theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  };

  return (
    <Tooltip label="Toggle theme">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.09] hover:text-white light:border-slate-200 light:bg-white light:text-slate-600 light:hover:text-slate-950"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
    </Tooltip>
  );
}
