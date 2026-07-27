"use client";

import { useEffect, useState } from "react";
import { ApplyFlowMark } from "@/components/brand/Logo";

/**
 * Branded cold-start splash.
 *
 * Rendered in the dashboard layout, so it appears on a real full page load /
 * hydration and NOT on client-side navigation between dashboard tabs (the layout
 * persists across those, so it never remounts). It is not tied to a fake timer:
 * it waits for the document to actually finish loading (`window.load` — which,
 * for the streamed dashboard, means the first data has arrived), then fades.
 *
 * MIN_VISIBLE_MS is a small floor (400ms) purely to avoid an ugly sub-100ms
 * flash-and-vanish on instant loads; it never extends a slow load. Reduced-motion
 * users get no pulse/shimmer/fade (handled by the global media query in
 * globals.css) — just a brief static screen.
 */
const MIN_VISIBLE_MS = 400;
const FADE_MS = 500;

export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "done">("visible");

  useEffect(() => {
    let cancelled = false;
    let fadeTimer: ReturnType<typeof setTimeout>;
    let doneTimer: ReturnType<typeof setTimeout>;
    const start = performance.now();

    const begin = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
      fadeTimer = setTimeout(() => {
        if (cancelled) return;
        setPhase("leaving");
        doneTimer = setTimeout(() => {
          if (!cancelled) setPhase("done");
        }, FADE_MS + 80);
      }, wait);
    };

    if (document.readyState === "complete") {
      begin();
    } else {
      window.addEventListener("load", begin, { once: true });
    }

    return () => {
      cancelled = true;
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      window.removeEventListener("load", begin);
    };
  }, []);

  if (phase === "done") return null;

  const leaving = phase === "leaving";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!leaving}
      aria-hidden={leaving}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 38%, rgb(var(--grad-hero-from)) 0%, rgb(var(--bg)) 62%), rgb(var(--bg))",
        opacity: leaving ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: leaving ? "none" : "auto"
      }}
    >
      <div className="splash-pulse flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-fg shadow-lg">
          <ApplyFlowMark className="h-9 w-9" />
        </div>
        <div className="mt-5 text-xl font-semibold tracking-[-0.02em] text-content">ApplyFlow</div>
      </div>

      <div className="mt-9 h-0.5 w-40 overflow-hidden rounded-full bg-[rgb(var(--line)/0.09)]">
        <div className="splash-bar h-full w-1/3 rounded-full bg-[rgb(var(--text)/0.85)]" />
      </div>

      <span className="sr-only">Loading ApplyFlow…</span>
    </div>
  );
}
