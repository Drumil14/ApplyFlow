import { describe, expect, it } from "vitest";
import { AI_LIMITS, clampAnalysis, jobAIAnalysisSchema, type JobAIAnalysis } from "@/lib/ai/schema";

const base: JobAIAnalysis = {
  roleTitle: "Frontend Engineer",
  seniority: "Mid-level",
  summary: "Build accessible React UIs.",
  requiredSkills: [],
  preferredSkills: [],
  responsibilities: [],
  strengths: [],
  gaps: [],
  resumeSuggestions: [],
  interviewTopics: []
};

describe("clampAnalysis", () => {
  it("trims each array to its configured cap", () => {
    const overflowing: JobAIAnalysis = {
      ...base,
      requiredSkills: Array.from({ length: 20 }, (_, i) => `req-${i}`),
      resumeSuggestions: Array.from({ length: 20 }, (_, i) => `sug-${i}`),
      interviewTopics: Array.from({ length: 20 }, (_, i) => `topic-${i}`)
    };

    const clamped = clampAnalysis(overflowing);

    expect(clamped.requiredSkills).toHaveLength(AI_LIMITS.requiredSkills);
    expect(clamped.resumeSuggestions).toHaveLength(AI_LIMITS.resumeSuggestions);
    expect(clamped.interviewTopics).toHaveLength(AI_LIMITS.interviewTopics);
  });

  it("leaves short arrays untouched", () => {
    const clamped = clampAnalysis({ ...base, strengths: ["React"] });
    expect(clamped.strengths).toEqual(["React"]);
  });
});

describe("jobAIAnalysisSchema", () => {
  it("rejects a payload missing required fields", () => {
    const result = jobAIAnalysisSchema.safeParse({ roleTitle: "x" });
    expect(result.success).toBe(false);
  });

  it("accepts a fully-formed payload", () => {
    expect(jobAIAnalysisSchema.safeParse(base).success).toBe(true);
  });
});
