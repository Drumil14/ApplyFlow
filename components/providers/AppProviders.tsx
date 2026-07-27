"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode, useEffect } from "react";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    const theme = window.localStorage.getItem("applyflow-theme") ?? "dark";
    document.documentElement.classList.toggle("light", theme === "light");
  }, []);

  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgb(var(--elevated))",
            border: "1px solid rgb(var(--line) / 0.12)",
            color: "rgb(var(--text))",
            borderRadius: "0.625rem",
            boxShadow: "var(--shadow-lg)"
          }
        }}
      />
    </SessionProvider>
  );
}
