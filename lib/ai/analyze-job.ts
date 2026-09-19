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

export type AiStatus = "ok" | "unconfigured" | "failed";

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
};

export type AnalyzeJobParams = {
  jobDescription: string;
  resumeSkills: string[];
  resumeText?: string | null;
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
  resumeText
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
    aiStatus: "unconfigured"
  };

  // 2. AI layer — best-effort. Never let it break the deterministic result.
  const provider = await getAIProvider();
  if (!provider) return base;

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
