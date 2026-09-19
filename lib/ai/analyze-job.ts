/**
 * High-level analysis orchestrator.
 *
 * Combines the transparent, deterministic skill matcher with an optional LLM
 * interpretation layer. The deterministic result is always produced; the AI
 * layer degrades gracefully — if no provider is configured, or the call fails,
 * times out, or returns invalid data, `ai` is null and `aiStatus` explains why,
 * but the analysis is still usable.
 */

import { clampAnalysis, type JobAIAnalysis } from "@/lib/ai/schema";
import { getAIProvider } from "@/lib/ai/provider";
import { scoreMatch } from "@/lib/scoring";
import { extractSkills } from "@/lib/skills";

export type AiStatus =
  | "ok"
  | "unconfigured"
  | "failed"
  | "rate_limited"
  | "rate_limit_unavailable";

/** Non-sensitive rate-limit metadata surfaced to the UI (no identifiers). */
export type AiRateLimitInfo = {
  limit: number;
  remaining: number;
  /** Unix timestamp (ms) when the window resets. */
  reset: number;
};

/**
 * Decision returned by the injected AI gate. `allow: true` means the caller may
 * spend Anthropic credits; otherwise the AI stage is skipped with a reason.
 */
export type AiGateDecision =
  | { allow: true }
  | {
      allow: false;
      status: "rate_limited" | "rate_limit_unavailable";
      rateLimit?: AiRateLimitInfo;
    };

export type CombinedAnalysis = {
  // Deterministic layer (always present).
  matchScore: number;
  matched: string[];
  missing: string[];
  requiredSkills: string[];
  technologies: string[];
  seniorityLevel: string;
  keywords: string[];
  resumeSuggestions: string[];
  // AI layer (optional).
  ai: JobAIAnalysis | null;
  aiStatus: AiStatus;
  /** Present only when the AI layer was rate limited. */
  aiRateLimit: AiRateLimitInfo | null;
};

export type AnalyzeJobParams = {
  jobDescription: string;
  resumeSkills: string[];
  resumeText?: string | null;
  /**
   * Consulted only when an AI provider is configured, immediately before
   * spending Anthropic credits. Lets the route enforce rate limiting without
   * this module knowing anything about Redis. Omit to skip gating (e.g. a
   * deterministic-only caller, or unit tests).
   */
  aiGate?: () => Promise<AiGateDecision>;
};

const seniorityFor = (description: string): string => {
  const text = description.toLowerCase();
  if (text.includes("staff")) return "Staff";
  if (text.includes("senior")) return "Senior";
  if (text.includes("intern")) return "Intern";
  if (text.includes("junior") || text.includes("new grad")) return "Junior";
  return "Mid-level";
};

export async function analyzeJob({
  jobDescription,
  resumeSkills,
  resumeText,
  aiGate
}: AnalyzeJobParams): Promise<CombinedAnalysis> {
  // 1. Deterministic layer — pure, transparent, always available.
  const jdSkills = extractSkills(jobDescription);
  const { score, matched, missing } = scoreMatch(jdSkills, resumeSkills);
  const seniorityLevel = seniorityFor(jobDescription);

  const base: CombinedAnalysis = {
    matchScore: score,
    matched,
    missing,
    requiredSkills: jdSkills,
    technologies: matched,
    seniorityLevel,
    keywords: resumeSkills,
    resumeSuggestions: missing.map((skill) => `Job asks for ${skill} — not found in this resume version.`),
    ai: null,
    aiStatus: "unconfigured",
    aiRateLimit: null
  };

  // 2. AI layer — best-effort. Never let it break the deterministic result.
  const provider = await getAIProvider();
  if (!provider) return base;

  // 3. Gate the paid AI call. Only consulted once we know a provider exists, so
  //    obviously-unconfigured requests never consume rate-limit quota.
  if (aiGate) {
    const decision = await aiGate();
    if (!decision.allow) {
      return { ...base, aiStatus: decision.status, aiRateLimit: decision.rateLimit ?? null };
    }
  }

  try {
    const ai = await provider.analyzeJob({
      jobDescription,
      resumeText,
      resumeSkills,
      matchedSkills: matched,
      missingSkills: missing,
      deterministicScore: score
    });
    return { ...base, ai: clampAnalysis(ai), aiStatus: "ok" };
  } catch (error) {
    console.error("[analyze-job] AI analysis failed:", error);
    return { ...base, aiStatus: "failed" };
  }
}
