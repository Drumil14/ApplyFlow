/**
 * Anthropic (Claude) implementation of AIProvider.
 *
 * Uses structured outputs so the model must return JSON matching our schema,
 * then validates that JSON with Zod before returning it. The API key never
 * leaves the server — this module is only ever imported from route handlers.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, AnalyzeJobInput } from "@/lib/ai/provider";
import { JOB_AI_JSON_SCHEMA, jobAIAnalysisSchema, type JobAIAnalysis } from "@/lib/ai/schema";

// Default to the most capable model; override with ANALYZE_MODEL if desired.
const MODEL = process.env.ANALYZE_MODEL ?? "claude-opus-4-8";

const SYSTEM_PROMPT = `You are a precise technical recruiter and resume coach helping a candidate understand how their resume fits a specific job description.

Rules you must follow:
- Base every claim strictly on the provided resume text and job description. Do not invent experience, employers, or skills.
- If a skill or experience the job wants is not present in the resume, list it under "gaps". Never suggest the candidate claim experience they do not have.
- "strengths" are genuine overlaps supported by the resume. "resumeSuggestions" are honest ways to better present real experience or close a gap through learning — not fabrication.
- Keep every item short and scannable (a phrase or one sentence). Return only the requested JSON.`;

function buildUserPrompt(input: AnalyzeJobInput): string {
  const resumeSection = input.resumeText?.trim()
    ? input.resumeText.trim()
    : `No full resume text was stored. Known resume skills: ${input.resumeSkills.join(", ") || "none recorded"}.`;

  return [
    "Analyze how this resume fits the job description.",
    "",
    "For reference, a deterministic keyword matcher already computed:",
    `- Match score: ${input.deterministicScore}%`,
    `- Matched skills: ${input.matchedSkills.join(", ") || "none"}`,
    `- Missing skills: ${input.missingSkills.join(", ") || "none"}`,
    "",
    "=== RESUME ===",
    resumeSection,
    "",
    "=== JOB DESCRIPTION ===",
    input.jobDescription.trim()
  ].join("\n");
}

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor() {
    // Fail fast in the constructor rather than deep in a request.
    this.client = new Anthropic({ timeout: 30_000, maxRetries: 1 });
  }

  async analyzeJob(input: AnalyzeJobInput): Promise<JobAIAnalysis> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input) }],
      output_config: { format: { type: "json_schema", schema: JOB_AI_JSON_SCHEMA } }
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    if (!text.trim()) {
      throw new Error("AI returned an empty response.");
    }

    // Structured outputs guarantee valid JSON, but we still parse + Zod-validate
    // defensively so a schema drift can never reach the UI as `any`.
    const parsed = jobAIAnalysisSchema.parse(JSON.parse(text));
    return parsed;
  }
}
