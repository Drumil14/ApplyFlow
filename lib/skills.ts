/**
 * Local, deterministic skill extraction. No network, no LLM.
 *
 * `KNOWN_SKILLS` is the canonical vocabulary. `SYNONYMS` maps common variants
 * onto a single canonical token so that "react.js", "reactjs" and "react" all
 * collapse to "react". `extractSkills` lowercases input, matches skills as whole
 * words (so "java" never matches inside "javascript"), normalizes via the
 * synonyms map, and returns a deduped list of canonical tokens.
 */

// Canonical, lowercase skill tokens. Extend freely — matching is data-driven.
export const KNOWN_SKILLS: string[] = [
  // Languages
  "javascript",
  "typescript",
  "python",
  "java",
  "kotlin",
  "swift",
  "go",
  "rust",
  "ruby",
  "php",
  "c++",
  "c#",
  "scala",
  "elixir",
  "sql",
  "html",
  "css",
  "sass",
  // Frontend
  "react",
  "next.js",
  "vue",
  "nuxt",
  "angular",
  "svelte",
  "redux",
  "tailwind",
  "bootstrap",
  "webpack",
  "vite",
  // Backend / APIs
  "node",
  "express",
  "nestjs",
  "django",
  "flask",
  "fastapi",
  "spring",
  "rails",
  "laravel",
  ".net",
  "graphql",
  "rest",
  "grpc",
  // Data / stores
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "sqlite",
  "prisma",
  "sequelize",
  "elasticsearch",
  "kafka",
  // Cloud / infra / tooling
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "terraform",
  "git",
  "ci/cd",
  "jest",
  "vitest",
  "cypress",
  "playwright"
];

// variant -> canonical token. Keys are matched exactly like known skills.
export const SYNONYMS: Record<string, string> = {
  "react.js": "react",
  reactjs: "react",
  nextjs: "next.js",
  next: "next.js",
  "node.js": "node",
  nodejs: "node",
  "vue.js": "vue",
  vuejs: "vue",
  postgres: "postgresql",
  postgresdb: "postgresql",
  psql: "postgresql",
  mongo: "mongodb",
  js: "javascript",
  ts: "typescript",
  golang: "go",
  "tailwindcss": "tailwind",
  "tailwind css": "tailwind",
  dotnet: ".net",
  restful: "rest",
  "rest api": "rest",
  "ci cd": "ci/cd",
  cicd: "ci/cd",
  k8s: "kubernetes",
  gql: "graphql",
  postgresql: "postgresql"
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A term matches only when it is not flanked by other alphanumerics. This uses
// explicit lookarounds instead of \b so tokens containing "." or "+" (next.js,
// c++) still respect boundaries, and "java" cannot match inside "javascript".
function matches(haystack: string, term: string): boolean {
  const pattern = new RegExp(`(?<![a-z0-9])${escapeRegExp(term)}(?![a-z0-9])`);
  return pattern.test(haystack);
}

/**
 * Extract canonical skills from arbitrary text.
 * Deterministic and pure: same input always yields the same deduped output.
 */
export function extractSkills(text: string): string[] {
  const haystack = (text ?? "").toLowerCase();
  const found = new Set<string>();

  // Search both the canonical vocabulary and every synonym key.
  const terms = [...KNOWN_SKILLS, ...Object.keys(SYNONYMS)];
  for (const term of terms) {
    if (matches(haystack, term)) {
      found.add(SYNONYMS[term] ?? term);
    }
  }

  return [...found];
}
