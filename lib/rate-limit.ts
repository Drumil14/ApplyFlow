/**
 * Server-side rate limiting for the paid AI (Anthropic) portion of ApplyFlow.
 *
 * The deterministic matcher is unlimited and is never gated here. This module
 * only protects Anthropic credits on the public deployment: each identifier may
 * run a fixed number of AI analyses per rolling 24h window.
 *
 * Fail-closed by design. If Upstash is not configured, or Redis is unreachable,
 * `checkAIAnalysisLimit` returns `"unavailable"` and the caller skips the
 * Anthropic request entirely rather than making an unrestricted paid call. The
 * whole point of the limiter is to protect spend, so "we can't tell" must mean
 * "don't spend".
 *
 * IMPORTANT: this module is server-only. The Upstash REST token is read from a
 * non-`NEXT_PUBLIC_*` env var and never leaves the server. It must only ever be
 * imported from route handlers / server code — never from a client component.
 */

import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/** Max successful AI analyses granted per identifier per window. */
export const AI_ANALYSIS_LIMIT = 5;
/** Rolling window for the fixed-window limiter. */
export const AI_ANALYSIS_WINDOW = "24 h" as const;
/** Redis key namespace. Actual keys look like `applyflow:ai-analysis:<hash>`. */
const KEY_PREFIX = "applyflow:ai-analysis";

export type AiRateLimitResult =
  | { status: "ok"; limit: number; remaining: number; reset: number }
  | { status: "rate_limited"; limit: number; remaining: number; reset: number }
  /** Limiter could not be consulted (unconfigured or Redis error) — fail closed. */
  | { status: "unavailable" };

// Cache the limiter across invocations, keyed on the credentials it was built
// with. Re-reading env each call keeps the module import-safe and lets tests
// toggle configuration on and off without a stale singleton.
let cached: { key: string; limiter: Ratelimit } | null = null;

function getRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const key = `${url} ${token}`;
  if (cached?.key === key) return cached.limiter;

  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.fixedWindow(AI_ANALYSIS_LIMIT, AI_ANALYSIS_WINDOW),
    prefix: KEY_PREFIX,
    // No background analytics writes — we only need the counter.
    analytics: false
  });
  cached = { key, limiter };
  return limiter;
}

/**
 * Hash the identifier before it becomes part of a Redis key. We never store the
 * raw user id or IP: a stable one-way digest is enough to count per-user usage
 * while keeping personal identifiers out of Redis.
 */
function hashIdentifier(identifier: string): string {
  return createHash("sha256").update(identifier).digest("hex").slice(0, 40);
}

/**
 * Consume one AI-analysis attempt for `identifier` and report whether it is
 * allowed. Callers must gate the Anthropic request on `status === "ok"`.
 *
 * NOTE ON QUOTA CONSUMPTION: calling this consumes one attempt from the window
 * (fixed-window increment). It should therefore be invoked only for requests
 * that have already passed schema/eligibility validation and are about to reach
 * the AI stage — never for obviously invalid requests.
 */
export async function checkAIAnalysisLimit(identifier: string): Promise<AiRateLimitResult> {
  const limiter = getRatelimit();
  if (!limiter) return { status: "unavailable" };

  try {
    const { success, limit, remaining, reset } = await limiter.limit(hashIdentifier(identifier));
    return { status: success ? "ok" : "rate_limited", limit, remaining, reset };
  } catch (error) {
    // Redis unreachable / transient error. Fail closed to protect paid credits.
    // Never log the identifier or any secret — only the error shape.
    console.error("[rate-limit] Upstash check failed:", error);
    return { status: "unavailable" };
  }
}
