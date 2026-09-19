# ApplyFlow

**An AI-assisted job application workspace built around transparent matching, structured insights, and production-quality frontend architecture.**

ApplyFlow helps users manage applications, compare job descriptions against different resume versions, and understand where their experience aligns with a role.

Instead of hiding everything behind an AI-generated score, ApplyFlow separates:

- deterministic skill matching
- qualitative AI analysis
- resume evidence
- actionable improvement opportunities

Built with Next.js, React, TypeScript, TanStack Query, Prisma, PostgreSQL, Anthropic, and Storybook.

---

## Why I built it

Job-search tools often collapse everything into a vague “AI match score.”

I wanted ApplyFlow to be more transparent.

The core matcher is deterministic and explainable: it shows exactly which skills are present and missing.

AI is layered on top to provide qualitative context such as:

- strengths supported by the resume
- gaps not explicitly demonstrated
- role responsibilities
- resume opportunities
- likely interview topics

If the AI layer is unavailable, the core product still works.

---

## Core features

### Resume-to-job matching

Select a saved resume, paste a job description, and receive:

- deterministic skill match
- matched skills
- missing skills
- seniority signal
- resume suggestions

The deterministic matcher remains independent from the LLM.

---

### Structured AI insights

ApplyFlow integrates Anthropic for qualitative job analysis.

The model returns structured output instead of free-form chat responses, including:

- role summary
- strengths
- gaps
- main responsibilities
- resume opportunities
- interview topics

Responses are validated with Zod before reaching the UI.

The AI layer is designed to avoid inventing experience or encouraging users to claim skills they do not have.

---

### Resume upload from device

Users can add a resume directly from the Analyzer.

Supported flows:

- upload a PDF
- paste resume text manually

PDF text extraction happens in the browser using `pdfjs-dist`.

The raw PDF file is never stored or uploaded by ApplyFlow.

Only the extracted resume text and resume metadata are persisted to the user's workspace.

---

### Multiple resume versions

Users can maintain multiple versions of a resume and compare them against different roles.

Each resume can include:

- title
- version
- target role
- source filename
- extracted resume text
- detected skills

A newly created resume is immediately added to the UI and automatically selected without requiring a refresh.

---

### Application tracking

Applications can be managed through a Kanban-style workflow.

Stages include:

- Applied
- OA
- Interview
- Final
- Offer
- Rejected

Mutations use optimistic updates so interactions feel immediate, with rollback behavior if a server request fails.

---

### Analysis history

Previous analyses are available inside the product so users can revisit earlier job matches instead of starting from scratch every time.

---

## AI cost protection

The public AI endpoint is protected using Upstash Redis and `@upstash/ratelimit`.

AI analysis is limited to:

**5 AI analyses per identifier per 24-hour fixed window**

Authenticated users are identified by their user ID.

If no authenticated user is available, the server falls back to a server-derived IP identifier.

Identifiers are hashed before being used as Redis keys.

If the rate limit is reached:

- Anthropic is not called
- the deterministic matcher continues working
- the UI shows a non-blocking rate-limit message

If Redis is unavailable or misconfigured, ApplyFlow fails closed and does not make unrestricted paid AI requests.

---

## Frontend architecture

ApplyFlow V2 introduced a dedicated server-state layer using TanStack Query.

Reusable hooks handle application data, resumes, activity, analysis history, and mutations.

Examples include:

```ts
useApplications()
useResumes()
useActivity()
useAnalysis()
useCreateResume()
