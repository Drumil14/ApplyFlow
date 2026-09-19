# ApplyFlow

**AI-assisted job application tracking with transparent resume matching and structured job insights.**

ApplyFlow helps job seekers manage applications, compare job descriptions against different resume versions, and understand where their experience aligns with a role.

Instead of hiding everything behind an AI-generated score, ApplyFlow separates **deterministic skill matching** from **qualitative AI analysis**, so users can see what is actually driving the result.

🔗 [**Live Demo**](https://apply-flow-orcin.vercel.app) · [**GitHub Repo**](https://github.com/Drumil14/ApplyFlow) · [**Portfolio**](https://drumilmistry.netlify.app/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [AI Architecture](#ai-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Design System & Accessibility](#design-system)
- [Performance](#performance)
- [Testing](#testing)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-architecture)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Validation](#validation)
- [Engineering Decisions](#engineering-decisions)
- [Author](#author)

---

## Overview

Job-search tools often return a vague AI-generated match percentage without explaining where it came from. I wanted ApplyFlow to work differently.

The primary match score is calculated **deterministically** from the resume and job description. Users can see:

- Matched skills
- Missing skills
- Seniority signals
- Resume improvement opportunities

Anthropic is then used as a second layer to provide qualitative context such as strengths, gaps, responsibilities, and interview topics.

If the AI layer is unavailable, the core matching experience continues to work.

---

## Features

### Resume-to-job matching

Select a saved resume, paste a job description, and receive a transparent skill match, including:

- Skill match percentage
- Matched skills
- Missing skills
- Seniority signal
- Resume suggestions

The percentage is calculated independently from the LLM.

### Structured AI insights

ApplyFlow integrates the Anthropic API for deeper qualitative analysis, including:

- Role summary
- Resume-supported strengths
- Gaps not explicitly demonstrated
- Key responsibilities
- Resume opportunities
- Interview topics

AI responses are returned as structured data and validated with **Zod** before being rendered in the interface. The AI layer is designed to avoid inventing experience or suggesting that users claim skills they do not actually have.

### Upload a resume from your device

Users can add a resume directly from the Analyzer via two input methods:

- Upload PDF
- Paste resume text

PDF text extraction happens entirely in the browser using `pdfjs-dist`. The raw PDF file is **not** stored or uploaded — only the extracted resume text and associated metadata are sent to the application's API and persisted for future matching.

### Multiple resume versions

Users can maintain multiple resume versions for different types of roles. Each resume can include:

- Title
- Version tag
- Target role
- Source filename
- Extracted resume text
- Detected skills

After a new resume is created, TanStack Query updates the cache and automatically selects it in the Analyzer without requiring a page refresh.

### Application tracking

Applications can be organized through a Kanban-style workflow with stages:

`Applied → OA → Interview → Final → Offer / Rejected`

Application mutations use optimistic updates so the UI responds immediately. If a request fails, the previous state is restored.

### Resume management

A dedicated workspace for maintaining resume versions and viewing the skills detected from each resume — making it easier to compare different resumes against different job descriptions instead of relying on one generic resume for every application.

### Analysis history

Previous match records can be revisited from the Analyzer, making it easier to review earlier role comparisons.

### Job application activity

ApplyFlow tracks application activity and surfaces it throughout the dashboard, so users can review their job-search progress without manually keeping separate notes or spreadsheets.

---

## AI Architecture

ApplyFlow deliberately separates deterministic analysis from AI analysis:

```text
Resume + Job Description
          │
          ▼
   Request Validation
          │
          ▼
 Deterministic Matcher
          │
          ├──────────────► Skill Match
          │                Matched Skills
          │                Missing Skills
          │                Seniority
          │
          ▼
  AI Eligibility Check
          │
          ▼
     Rate Limiter
          │
     ┌────┴────┐
     │         │
  Allowed    Blocked
     │         │
     ▼         ▼
 Anthropic    Skip AI
     │         │
     ▼         │
Structured     │
Response       │
     │         │
     ▼         │
Zod Validation │
     │         │
     └────┬────┘
          ▼
       UI Result
```

This architecture keeps the product usable even when the external AI service is unavailable.

### AI cost protection

Because Anthropic is a paid API, public AI requests are protected using **Upstash Redis** and `@upstash/ratelimit`.

**Current policy:** 5 AI analyses per identifier per 24-hour fixed window.

- When possible, authenticated users are identified by their user ID; otherwise the server falls back to an IP-derived identifier.
- Identifiers are hashed before being stored as Redis keys.
- No resume text, job description content, or other personal content is stored in Redis.

**When the limit is reached:** Anthropic is not called. The deterministic matcher continues to work normally, and the user receives a non-blocking message explaining that the daily AI limit has been reached.

**If Redis is unavailable:** ApplyFlow fails closed. The deterministic matcher keeps working, but the paid Anthropic request is skipped rather than allowing unrestricted AI usage.

---

## Frontend Architecture

ApplyFlow uses **TanStack Query** as its client-side server-state layer. Reusable hooks manage data fetching, caching, and mutations across the application, for example:

```
useApplications()
useResumes()
useActivity()
useAnalysis()
useCreateResume()
```

Server-rendered data is used as initial query data, allowing the application to keep the benefits of Next.js server rendering while gaining predictable client-side caching and mutations.

### Optimistic UI

Application interactions are designed to feel immediate. For example, moving an application through the Kanban follows this flow:

```text
User moves application
        │
        ▼
Update query cache immediately
        │
        ▼
Render updated UI
        │
        ▼
Send request to server
        │
   ┌────┴────┐
   │         │
Success    Failure
   │         │
 Keep     Restore
 State    Previous State
```

This pattern is also used where appropriate for other application mutations.

### Resume upload architecture

```text
User selects PDF
        │
        ▼
Validate file (PDF only · max 5 MB)
        │
        ▼
Load pdfjs-dist
        │
        ▼
Extract text in browser
        │
        ▼
Preview extracted content
        │
        ▼
Save resume
        │
        ▼
POST /api/resumes
        │
        ▼
Prisma + PostgreSQL
        │
        ▼
Update TanStack Query cache
        │
        ▼
Automatically select resume
```

`pdfjs-dist` is loaded only when PDF extraction is actually needed, keeping the initial Analyzer bundle smaller. Scanned PDFs without selectable text fall back to the manual paste workflow.

---

## Design System

ApplyFlow uses reusable UI primitives and semantic design tokens rather than treating every screen as a separate design. The component system includes patterns for:

- Buttons
- Cards
- Dialogs
- Form controls
- Skill badges
- Match scores
- Status indicators
- Empty states
- Feedback states

Reusable components are documented and tested through **Storybook**.

### Accessibility

- Keyboard-accessible interactions
- Labelled dialogs and inputs
- Focus management and restoration
- Skip navigation
- Visible focus states
- `aria-live` feedback for dynamic interactions
- Reduced-motion support
- Keyboard-accessible command interactions

The goal is to build interaction patterns that do not depend exclusively on mouse input.

---

## Performance

Performance work focuses on avoiding unnecessary client-side JavaScript:

- Route-scoped heavy dependencies
- Lazy-loaded PDF parsing
- Code-split Recharts usage
- Server-seeded TanStack Query data
- PDF processing only when requested
- Avoiding speculative memoization where it is not needed

---

## Testing

ApplyFlow currently has **59 automated tests** covering:

- Deterministic scoring
- Skill extraction
- AI schema validation
- Analyzer interactions
- TanStack Query hooks
- Optimistic mutation rollback
- Resume creation
- PDF validation
- Command-menu interactions
- Rate limiting
- Authenticated/IP identifier selection
- AI provider fallback behavior
- Missing rate-limit configuration
- Rate-limited UI states

**Testing stack:** Vitest · React Testing Library · Testing Library User Event · Jest DOM

External services such as Upstash are mocked during automated tests.

### Storybook

Reusable UI components are documented through Storybook, allowing component states and interaction patterns to be developed and reviewed independently from full application pages.

---

## Tech Stack

**Frontend**
Next.js · React · TypeScript · Tailwind CSS · TanStack Query · Zustand · Framer Motion · Recharts

**AI**
Anthropic API · structured AI outputs · Zod validation · provider abstraction · graceful degradation

**Data & Authentication**
Prisma · PostgreSQL · NextAuth · bcrypt

**Infrastructure**
Vercel · Upstash Redis

**File Processing**
pdfjs-dist

**Testing & Tooling**
Vitest · React Testing Library · Storybook · ESLint · TypeScript

---

## Project Architecture

```text
app/
├── api/
│   ├── analyze/
│   ├── analyses/
│   ├── applications/
│   ├── resumes/
│   ├── activity/
│   └── auth/
│
├── dashboard/
│   ├── analyzer/
│   ├── applications/
│   └── ...
│
components/
├── dashboard/
├── ui/
└── ...

lib/
├── ai/
│   ├── provider.ts
│   ├── anthropic.ts
│   ├── analyze-job.ts
│   └── schema.ts
│
├── api.ts
├── pdf.ts
├── queryKeys.ts
├── rate-limit.ts
├── session.ts
└── ...

hooks/
├── use-applications.ts
├── use-resumes.ts
├── use-activity.ts
├── use-analysis.ts
└── ...

tests/

prisma/
└── schema.prisma
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=

NEXTAUTH_SECRET=
NEXTAUTH_URL=

ANTHROPIC_API_KEY=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> Real credentials should never be committed. `.env.example` contains placeholders only.

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/Drumil14/ApplyFlow.git

# Enter the project
cd ApplyFlow

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Validation

Before production changes are merged, the project is validated with:

```bash
npm run typecheck
npm test
npm run lint
npm run build-storybook
npx next build
```

**Current test result:** `59/59 passing`

---

## Engineering Decisions

**Why not let AI generate the match percentage?**
LLM-generated percentages can be difficult to explain and may vary between requests. ApplyFlow therefore calculates its primary skill match deterministically. AI is used for the part it is better suited for: qualitative interpretation.

**Why structured AI instead of a chatbot?**
ApplyFlow is a product interface, not a general-purpose chat experience. Structured responses make AI results predictable, type-safe, testable, and easier to validate and render consistently.

**Why validate AI responses?**
External model output should not automatically be trusted by the application. The Anthropic response is validated against a Zod schema before being used by the UI.

**Why process PDFs in the browser?**
ApplyFlow only needs the textual content of the resume. Processing the PDF locally means the raw document does not need to be uploaded or stored — only extracted text and resume metadata are persisted.

**Why keep AI optional?**
A third-party AI provider should not determine whether the entire product works. The deterministic matcher remains available when Anthropic fails, is not configured, the user reaches the AI rate limit, or Redis is unavailable.

**Why fail closed when rate limiting fails?**
The rate limiter protects a paid external API. Allowing unrestricted Anthropic calls when Redis fails would defeat that protection. Instead, ApplyFlow keeps the free deterministic functionality available while temporarily disabling AI insights.

---

## What I Focused On

ApplyFlow started as a job application tracker and evolved into an exercise in production-quality frontend and product engineering. The V2 work focused on:

- React architecture
- Server-state management
- Optimistic UI
- Structured AI interfaces
- Third-party API integration
- Client-side file processing
- Accessibility
- Component systems & Storybook
- Frontend testing
- Graceful failure states
- Performance
- API cost protection

The goal was not just to add more features — it was to build an interface that behaves like a product I would actually want to maintain and ship.

---

## Links

- **Live Application:** [https://apply-flow-orcin.vercel.app](https://apply-flow-orcin.vercel.app)
- **GitHub Repository:** [https://github.com/Drumil14/ApplyFlow](https://github.com/Drumil14/ApplyFlow)
- **Portfolio:** [https://drumilmistry.netlify.app/](https://drumilmistry.netlify.app/)

---

## Author

**Drumil Mistry**
Frontend / Product Engineer focused on building polished interfaces where design, engineering, and AI meet.

[Portfolio](https://drumilmistry.netlify.app/) · [GitHub](https://github.com/Drumil14/ApplyFlow)
