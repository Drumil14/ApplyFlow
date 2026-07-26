import { describe, expect, it } from "vitest";
import { scoreMatch } from "@/lib/scoring";

describe("scoreMatch", () => {
  it("returns 0 when the job description has no skills", () => {
    const result = scoreMatch([], ["react", "typescript"]);
    expect(result.score).toBe(0);
    expect(result.matched).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it("scores 100 when the resume covers every job skill", () => {
    const result = scoreMatch(["react", "typescript"], ["react", "typescript", "node"]);
    expect(result.score).toBe(100);
    expect(result.matched).toEqual(["react", "typescript"]);
    expect(result.missing).toEqual([]);
  });

  it("scores partial overlap and reports matched + missing", () => {
    const result = scoreMatch(["react", "typescript", "graphql", "aws"], ["react", "typescript"]);
    expect(result.score).toBe(50);
    expect(result.matched).toEqual(["react", "typescript"]);
    expect(result.missing).toEqual(["graphql", "aws"]);
  });

  it("rounds to the nearest whole percent", () => {
    // 1 of 3 => 33.33 -> 33
    expect(scoreMatch(["react", "vue", "svelte"], ["react"]).score).toBe(33);
    // 2 of 3 => 66.67 -> 67
    expect(scoreMatch(["react", "vue", "svelte"], ["react", "vue"]).score).toBe(67);
  });

  it("does not let extra resume skills inflate the score above 100", () => {
    const result = scoreMatch(["react"], ["react", "typescript", "node", "aws", "graphql"]);
    expect(result.score).toBe(100);
    expect(result.matched).toEqual(["react"]);
    expect(result.missing).toEqual([]);
  });

  it("scores 0 when there is no overlap at all", () => {
    const result = scoreMatch(["python", "django"], ["react", "node"]);
    expect(result.score).toBe(0);
    expect(result.matched).toEqual([]);
    expect(result.missing).toEqual(["python", "django"]);
  });

  it("is pure — it does not mutate its inputs", () => {
    const jd = ["react", "aws"];
    const resume = ["react"];
    scoreMatch(jd, resume);
    expect(jd).toEqual(["react", "aws"]);
    expect(resume).toEqual(["react"]);
  });
});
