/**
 * Vendor-neutral AI provider interface.
 *
 * The rest of the app depends only on `AIProvider` and `getAIProvider()`, never
 * on a concrete SDK. Swapping vendors means adding one file and one branch in
 * the factory — nothing else changes. When no provider is configured (no API
 * key), the factory returns null and the caller falls back to the deterministic
 * analyzer.
 */

import type { JobAIAnalysis } from "@/lib/ai/schema";

export type AnalyzeJobInput = {
  /** Full job description text pasted by the user. */
  jobDescription: string;
  /** Full resume text, when the resume version stored one. */
  resumeText?: string | null;
  /** Deterministic skill signals, passed so the model can reason about them. */
  resumeSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  /** Deterministic 0–100 match score, for context only. */
  deterministicScore: number;
};

export interface AIProvider {
  readonly name: string;
  analyzeJob(input: AnalyzeJobInput): Promise<JobAIAnalysis>;
}

/**
 * Resolve the configured provider, or null when none is set up.
 * Reads env lazily so the module is import-safe in every environment.
 */
export async function getAIProvider(): Promise<AIProvider | null> {
  if (process.env.ANTHROPIC_API_KEY) {
    const { AnthropicProvider } = await import("@/lib/ai/anthropic");
    return new AnthropicProvider();
  }
  return null;
}
