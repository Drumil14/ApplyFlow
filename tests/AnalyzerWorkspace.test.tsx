import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyzerWorkspace } from "@/components/dashboard/AnalyzerWorkspace";
import type { AnalysisResult, Resume } from "@/types/app";

const resume1: Resume = {
  id: "r1",
  title: "Frontend Resume",
  versionTag: "v2",
  fileName: "frontend.pdf",
  targetRole: "Frontend Engineer",
  skills: ["react", "typescript"],
  score: 0,
  interviews: 0,
  offers: 0,
  rejections: 0,
  createdAt: "2026-01-01T00:00:00.000Z"
};
const resumes = [resume1];

const deterministic = {
  requiredSkills: ["react", "graphql"],
  technologies: ["react"],
  seniorityLevel: "Mid-level",
  keywords: ["react", "typescript"],
  resumeSuggestions: ["Job asks for graphql — not found in this resume version."],
  matchScore: 82,
  matched: ["react"],
  missing: ["graphql"]
};

const withAi: AnalysisResult = {
  ...deterministic,
  aiStatus: "ok",
  ai: {
    roleTitle: "Senior Frontend Role",
    seniority: "Senior",
    summary: "This role centers on shipping accessible React surfaces.",
    requiredSkills: ["react"],
    preferredSkills: ["graphql"],
    responsibilities: ["Own the design system"],
    strengths: ["Strong React foundation"],
    gaps: ["No GraphQL evidence"],
    resumeSuggestions: ["Add measurable UI impact"],
    interviewTopics: ["Rendering performance"]
  }
};

const aiFailed: AnalysisResult = { ...deterministic, ai: null, aiStatus: "failed" };

function renderWorkspace() {
  const client = new QueryClient({
    // staleTime Infinity so the resumes query never background-refetches over the
    // seeded initialData during these tests.
    defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } }
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return render(createElement(AnalyzerWorkspace, { initialResumes: resumes }), { wrapper });
}

function mockFetchOnce(value: unknown, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok, json: async () => value }))
  );
}

afterEach(() => vi.unstubAllGlobals());
beforeEach(() => vi.restoreAllMocks());

async function submitAnalysis(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByLabelText(/job description/i),
    "We need a frontend engineer strong in React and TypeScript to build accessible UI at scale."
  );
  await user.click(screen.getByRole("button", { name: /analyze match/i }));
}

describe("AnalyzerWorkspace", () => {
  it("submits and renders the structured AI result", async () => {
    mockFetchOnce({ analysis: withAi });
    const user = userEvent.setup();
    renderWorkspace();

    await submitAnalysis(user);

    expect(await screen.findByText("82")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /ai insights/i })).toBeInTheDocument();
    expect(screen.getByText(/accessible react surfaces/i)).toBeInTheDocument();
    expect(screen.getByText("Strong React foundation")).toBeInTheDocument();
    expect(screen.getByText("Rendering performance")).toBeInTheDocument();
  });

  it("falls back to deterministic-only when AI is unavailable", async () => {
    mockFetchOnce({ analysis: aiFailed });
    const user = userEvent.setup();
    renderWorkspace();

    await submitAnalysis(user);

    // Deterministic score still shows...
    expect(await screen.findByText("82")).toBeInTheDocument();
    // ...and the AI panel degrades gracefully.
    expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
  });

  it("shows an error state when the request fails", async () => {
    mockFetchOnce({ message: "We could not analyze this role right now." }, false);
    const user = userEvent.setup();
    renderWorkspace();

    await submitAnalysis(user);

    expect(await screen.findByText(/analysis needs another pass/i)).toBeInTheDocument();
    expect(screen.getByText(/could not analyze this role/i)).toBeInTheDocument();
  });

  it("adds a pasted-text resume from the Analyzer and auto-selects it", async () => {
    const newResume = {
      id: "r2",
      title: "Backend Resume",
      versionTag: "v1",
      fileName: "backend-resume.txt",
      targetRole: null,
      skills: ["node", "postgresql"],
      score: 0,
      interviews: 0,
      offers: 0,
      rejections: 0,
      createdAt: "2026-02-01T00:00:00.000Z"
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (String(url).includes("/api/resumes") && init?.method === "POST") {
          return { ok: true, json: async () => ({ resume: newResume }) };
        }
        return { ok: true, json: async () => ({ resumes }) };
      })
    );
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(screen.getByRole("button", { name: /add resume/i }));
    await user.click(screen.getByRole("button", { name: /paste text/i }));
    await user.type(screen.getByLabelText(/resume text/i), "Backend engineer with Node.js and PostgreSQL.");
    await user.type(screen.getByLabelText(/^title$/i), "Backend Resume");
    await user.click(screen.getByRole("button", { name: /save & use resume/i }));

    // Dialog closes and the new resume is selected in the existing combobox.
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("combobox")).toHaveTextContent(/Backend Resume/);
  });
});
