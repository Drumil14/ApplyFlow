import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the provider factory so we control whether/what AI provider exists and
// can assert exactly when its analyzeJob is (not) called. vi.hoisted keeps the
// shared mock referenceable inside the (hoisted) vi.mock factory.
const { getAIProviderMock } = vi.hoisted(() => ({ getAIProviderMock: vi.fn() }));
vi.mock("@/lib/ai/provider", () => ({ getAIProvider: getAIProviderMock }));

import { analyzeJob, type AiGateDecision } from "@/lib/ai/analyze-job";
import type { JobAIAnalysis } from "@/lib/ai/schema";

const AI: JobAIAnalysis = {
  roleTitle: "Frontend Engineer",
  seniority: "Mid-level",
  summary: "Builds accessible React UI.",
  requiredSkills: ["react"],
  preferredSkills: ["graphql"],
  responsibilities: ["Ship UI"],
  strengths: ["Strong React"],
  gaps: ["No GraphQL"],
  resumeSuggestions: ["Quantify impact"],
  interviewTopics: ["Rendering"]
};

const PARAMS = {
  jobDescription:
    "We need a frontend engineer strong in React and TypeScript to build accessible UI at scale, with GraphQL experience.",
  resumeSkills: ["react", "typescript"],
  resumeText: "React and TypeScript engineer."
};

function fakeProvider() {
  return { name: "test", analyzeJob: vi.fn().mockResolvedValue(AI) };
}

beforeEach(() => {
  getAIProviderMock.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("analyzeJob AI gating", () => {
  it("calls the provider and returns AI results when the gate allows", async () => {
    const provider = fakeProvider();
    getAIProviderMock.mockResolvedValue(provider);
    const gate = vi.fn(async (): Promise<AiGateDecision> => ({ allow: true }));

    const result = await analyzeJob({ ...PARAMS, aiGate: gate });

    expect(gate).toHaveBeenCalledTimes(1);
    expect(provider.analyzeJob).toHaveBeenCalledTimes(1);
    expect(result.aiStatus).toBe("ok");
    expect(result.ai).not.toBeNull();
    // Deterministic layer is always present.
    expect(result.matched).toContain("react");
  });

  it("does NOT call the provider when rate limited, but keeps the deterministic result", async () => {
    const provider = fakeProvider();
    getAIProviderMock.mockResolvedValue(provider);
    const gate = vi.fn(
      async (): Promise<AiGateDecision> => ({
        allow: false,
        status: "rate_limited",
        rateLimit: { limit: 5, remaining: 0, reset: 4242 }
      })
    );

    const result = await analyzeJob({ ...PARAMS, aiGate: gate });

    expect(provider.analyzeJob).not.toHaveBeenCalled();
    expect(result.aiStatus).toBe("rate_limited");
    expect(result.ai).toBeNull();
    expect(result.aiRateLimit).toEqual({ limit: 5, remaining: 0, reset: 4242 });
    // Deterministic match survives.
    expect(result.matchScore).toBeGreaterThan(0);
    expect(result.matched).toContain("react");
  });

  it("does NOT call the provider when the limiter is unavailable (fail closed)", async () => {
    const provider = fakeProvider();
    getAIProviderMock.mockResolvedValue(provider);
    const gate = vi.fn(
      async (): Promise<AiGateDecision> => ({ allow: false, status: "rate_limit_unavailable" })
    );

    const result = await analyzeJob({ ...PARAMS, aiGate: gate });

    expect(provider.analyzeJob).not.toHaveBeenCalled();
    expect(result.aiStatus).toBe("rate_limit_unavailable");
    expect(result.ai).toBeNull();
    expect(result.matched).toContain("react");
  });

  it("preserves graceful fallback when the provider fails after gate approval", async () => {
    const provider = fakeProvider();
    provider.analyzeJob.mockRejectedValue(new Error("anthropic 500"));
    getAIProviderMock.mockResolvedValue(provider);
    const gate = vi.fn(async (): Promise<AiGateDecision> => ({ allow: true }));

    const result = await analyzeJob({ ...PARAMS, aiGate: gate });

    expect(gate).toHaveBeenCalledTimes(1);
    expect(provider.analyzeJob).toHaveBeenCalledTimes(1);
    expect(result.aiStatus).toBe("failed");
    expect(result.ai).toBeNull();
    expect(result.matched).toContain("react");
  });

  it("never consults the gate (or consumes quota) when no provider is configured", async () => {
    getAIProviderMock.mockResolvedValue(null);
    const gate = vi.fn(async (): Promise<AiGateDecision> => ({ allow: true }));

    const result = await analyzeJob({ ...PARAMS, aiGate: gate });

    expect(gate).not.toHaveBeenCalled();
    expect(result.aiStatus).toBe("unconfigured");
    expect(result.ai).toBeNull();
    expect(result.matched).toContain("react");
  });
});
