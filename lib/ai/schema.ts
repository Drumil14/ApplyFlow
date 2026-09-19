/**
 * Structured contract for the LLM job analysis.
 *
 * The model is asked to return JSON matching JSON_SCHEMA (enforced server-side
 * via structured outputs). We then re-validate the parsed payload with Zod so a
 * malformed or partial response is caught before it reaches the UI, and clamp
 * every array to a sane length so a runaway model can't flood the interface.
 */

import { z } from "zod";

// Per-array caps. Kept short so the analyzer stays scannable.
export const AI_LIMITS = {
  requiredSkills: 10,
  preferredSkills: 8,
  responsibilities: 6,
  strengths: 6,
  gaps: 6,
  resumeSuggestions: 5,
  interviewTopics: 8
} as const;

// Zod schema used to validate the model's response after parsing. Array length
// is enforced by clampAnalysis (not here) so a slightly-too-long response is
// trimmed rather than rejected.
export const jobAIAnalysisSchema = z.object({
  roleTitle: z.string(),
  seniority: z.string(),
  summary: z.string(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  resumeSuggestions: z.array(z.string()),
  interviewTopics: z.array(z.string())
});

export type JobAIAnalysis = z.infer<typeof jobAIAnalysisSchema>;

// JSON Schema sent to the model via `output_config.format`. Structured outputs
// require `additionalProperties: false` and every property listed in `required`.
export const JOB_AI_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    roleTitle: { type: "string", description: "The job title, e.g. 'Frontend Engineer'." },
    seniority: { type: "string", description: "Seniority signal, e.g. Intern, Junior, Mid-level, Senior, Staff." },
    summary: { type: "string", description: "2-3 sentence plain-language summary of the role." },
    requiredSkills: { type: "array", items: { type: "string" }, description: "Must-have skills the job asks for." },
    preferredSkills: { type: "array", items: { type: "string" }, description: "Nice-to-have skills." },
    responsibilities: { type: "array", items: { type: "string" }, description: "Main day-to-day responsibilities." },
    strengths: { type: "array", items: { type: "string" }, description: "Where the resume genuinely overlaps with the role." },
    gaps: { type: "array", items: { type: "string" }, description: "Skills/experience the role wants that the resume does not show." },
    resumeSuggestions: { type: "array", items: { type: "string" }, description: "Concrete, honest ways to strengthen the resume for this role." },
    interviewTopics: { type: "array", items: { type: "string" }, description: "Likely interview topics to prepare." }
  },
  required: [
    "roleTitle",
    "seniority",
    "summary",
    "requiredSkills",
    "preferredSkills",
    "responsibilities",
    "strengths",
    "gaps",
    "resumeSuggestions",
    "interviewTopics"
  ]
} as const;

/** Trim every array to its configured cap. Pure — safe to unit test. */
export function clampAnalysis(analysis: JobAIAnalysis): JobAIAnalysis {
  return {
    ...analysis,
    requiredSkills: analysis.requiredSkills.slice(0, AI_LIMITS.requiredSkills),
    preferredSkills: analysis.preferredSkills.slice(0, AI_LIMITS.preferredSkills),
    responsibilities: analysis.responsibilities.slice(0, AI_LIMITS.responsibilities),
    strengths: analysis.strengths.slice(0, AI_LIMITS.strengths),
    gaps: analysis.gaps.slice(0, AI_LIMITS.gaps),
    resumeSuggestions: analysis.resumeSuggestions.slice(0, AI_LIMITS.resumeSuggestions),
    interviewTopics: analysis.interviewTopics.slice(0, AI_LIMITS.interviewTopics)
  };
}
