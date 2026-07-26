import { describe, expect, it } from "vitest";
import { extractSkills } from "@/lib/skills";

describe("extractSkills", () => {
  it("extracts known skills from free text", () => {
    const skills = extractSkills("We build with React, TypeScript and PostgreSQL.");
    expect(skills).toContain("react");
    expect(skills).toContain("typescript");
    expect(skills).toContain("postgresql");
  });

  it("normalizes synonyms to a single canonical token", () => {
    expect(extractSkills("Experience with React.js required")).toContain("react");
    expect(extractSkills("Strong reactjs background")).toContain("react");
    expect(extractSkills("We use Postgres in production")).toContain("postgresql");
    expect(extractSkills("Built with Next.js")).toContain("next.js");
    expect(extractSkills("Comfortable with nextjs")).toContain("next.js");
    expect(extractSkills("Plain JS and TS knowledge")).toEqual(
      expect.arrayContaining(["javascript", "typescript"])
    );
    expect(extractSkills("Golang services")).toContain("go");
    expect(extractSkills("Node.js APIs")).toContain("node");
  });

  it("collapses different variants of the same skill to one entry", () => {
    const skills = extractSkills("react, React.js, reactjs everywhere");
    expect(skills.filter((skill) => skill === "react")).toHaveLength(1);
  });

  it("matches whole words only — 'java' does NOT match inside 'javascript'", () => {
    const skills = extractSkills("Frontend built entirely in JavaScript");
    expect(skills).toContain("javascript");
    expect(skills).not.toContain("java");
  });

  it("still matches 'java' when it stands alone as a whole word", () => {
    const skills = extractSkills("Backend written in Java and Spring");
    expect(skills).toContain("java");
    expect(skills).toContain("spring");
  });

  it("does not match skills embedded inside larger words", () => {
    // 'go' should not match inside 'good', 'rest' should not match inside 'restaurant'
    const skills = extractSkills("A good restaurant recommendation engine");
    expect(skills).not.toContain("go");
    expect(skills).not.toContain("rest");
  });

  it("dedupes repeated skills", () => {
    const skills = extractSkills("aws aws aws and more aws");
    expect(skills.filter((skill) => skill === "aws")).toHaveLength(1);
  });

  it("is case-insensitive", () => {
    expect(extractSkills("GRAPHQL and Docker and KUBERNETES")).toEqual(
      expect.arrayContaining(["graphql", "docker", "kubernetes"])
    );
  });

  it("handles tokens containing punctuation like next.js and c++", () => {
    expect(extractSkills("Systems programming in C++")).toContain("c++");
    expect(extractSkills("Rendering with Next.js on the edge")).toContain("next.js");
  });

  it("returns an empty array when no skills are present", () => {
    expect(extractSkills("A friendly team that values curiosity and ownership.")).toEqual([]);
  });

  it("safely handles empty input", () => {
    expect(extractSkills("")).toEqual([]);
  });
});
