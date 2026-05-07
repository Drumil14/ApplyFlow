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
            background: "rgba(12, 17, 28, 0.92)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f8fafc",
            backdropFilter: "blur(18px)"
          }
        }}
      />
    </SessionProvider>
  );
}
