"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { SessionProvider } from "next-auth/react";
import { type ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  // One QueryClient per browser session. useState (not a module-level const)
  // keeps it stable across re-renders without sharing state between requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Server components seed initialData; don't immediately refetch it.
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      })
  );

  useEffect(() => {
    const theme = window.localStorage.getItem("applyflow-theme") ?? "dark";
    document.documentElement.classList.toggle("light", theme === "light");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* reducedMotion="user" makes every framer-motion animation honor the OS
          "reduce motion" setting — the CSS block in globals.css only covers CSS
          animations, not Framer's JS-driven transforms. */}
      <MotionConfig reducedMotion="user">
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
      </MotionConfig>
    </QueryClientProvider>
  );
}
