# ApplyFlow

A job-application tracker built as a frontend / design-engineering portfolio
project. Organize applications on a Kanban board, track resume versions, and
analyze how well a resume matches a job description using a transparent
deterministic matcher **plus** an optional LLM interpretation layer.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS** with a CSS-variable design-token system (dark/light)
- **TanStack Query** for client server-state (queries, mutations, optimistic updates)
- **Zustand** for local UI state (command palette)
- **Prisma** + **PostgreSQL** (Neon)
- **NextAuth** (email/password) with a demo-user fallback
- **Anthropic Claude** via `@anthropic-ai/sdk` for AI analysis, behind a swappable provider interface
- **Zod** for validating structured AI output
- **Vitest** + **React Testing Library** + `@testing-library/user-event`
- **Storybook** (`@storybook/nextjs`) for the design system
- **Framer Motion** (with global reduced-motion support), **Recharts** (code-split)

## Features

- **Kanban board** across Applied → OA → Interview → Final round → Offer → Rejected,
  with **optimistic** drag-and-drop status changes (instant UI, rollback on failure)
  and a screen-reader announcement on each move.
- **Application management**: statuses, recruiter details, links, salary ranges,
  deadlines, resume association; create/edit/delete with optimistic delete.
- **Resume versions**, each tied to the applications it carried; skills are
  extracted from pasted resume text at upload time.
- **Match analyzer** — two layers (see below).
- **Analysis history** — every analysis is saved and browsable; expand a row to
  revisit its stored required skills and resume suggestions.
- **Command palette** (Ctrl/⌘+K) with full keyboard navigation.
- Dashboard with pipeline, conversion, and a code-split weekly-activity chart.
- Dark/light themes; loading, empty, and error states across the main surfaces.

## AI architecture — deterministic + LLM

The analyzer runs **two layers**, and they are kept clearly separate:

```
Resume + Job Description
        │
        ├─► Deterministic skill matcher   (always runs — pure, testable)
        │       lib/skills.ts + lib/scoring.ts → score, matched, missing
        │
        └─► LLM analysis layer            (optional — graceful)
                lib/ai/* → validated structured JSON
        │
        ▼
   Combined result → Analyzer UI
```

**Deterministic layer** (`lib/skills.ts`, `lib/scoring.ts`): a local skills
dictionary extracts canonical skills from both the resume and the job
description, then scores the overlap:

```
score = round(100 * matched / total job-description skills)
```

It is pure, has no I/O, and is covered by unit tests. This is the source of
truth for the numeric match score.

**LLM layer** (`lib/ai/`): adds qualitative interpretation — role summary,
strengths, gaps, responsibilities, honest resume suggestions, and interview
topics. It is designed around a vendor-neutral interface so the model provider
can be swapped without touching the rest of the app:

```
lib/ai/
  provider.ts     AIProvider interface + getAIProvider() factory
  anthropic.ts    Claude implementation (structured outputs, server-only)
  schema.ts       Zod schema + JSON schema + per-array caps + clampAnalysis()
  analyze-job.ts  orchestrator: deterministic + AI, with graceful fallback
```

The model is asked to return JSON matching a JSON schema (structured outputs);
the response is then **re-validated with Zod** and clamped to sane array lengths
before it can reach the UI. The prompt explicitly forbids inventing experience —
missing skills are reported as gaps, never as things to falsely claim.

**Graceful degradation.** If the API key is missing, or the provider fails,
times out, or returns invalid data, the AI panel shows *"temporarily
unavailable" / "not configured"* and the deterministic match still works fully.
The API key is read only on the server (Node.js runtime) and never exposed to
the browser.

## Frontend data architecture

Server components fetch initial data with Prisma and pass it as `initialData` to
client components, which then own it through TanStack Query — so the first paint
has no loading flash, and subsequent reads/writes stay in sync:

- `hooks/use-applications.ts` — list + create/update/delete. Delete and the
  Kanban status change are **optimistic** with rollback (`onMutate` / `onError`).
- `hooks/use-resumes.ts`, `hooks/use-activity.ts`, `hooks/use-analysis.ts`
  (`useAnalyzeJob`, `useAnalysisHistory`).
- `lib/queryKeys.ts` — a small flat key registry; `lib/api.ts` — a shared
  `fetchJson` helper that surfaces server error messages.
- `hooks/use-command-menu.ts` — command-palette keyboard/filter logic extracted
  from the component so it can be unit-tested in isolation.

## Testing

`npm test` runs Vitest against both pure logic and UI behavior:

- **Pure logic**: `scoring`, `skills`, and the AI `schema` (clamp + Zod).
- **Hook behavior**: optimistic status change + rollback and optimistic delete +
  rollback (`use-applications`), and the command-palette logic
  (`use-command-menu`).
- **Component behavior** (React Testing Library + user-event): the analyzer —
  paste + submit, structured AI result, deterministic-only fallback when AI is
  unavailable, and the API-error state.

Tests target user-visible behavior rather than implementation details.

## Accessibility

Worked on (not a claim of full WCAG conformance):

- Skip-to-content link; semantic landmarks; `aria-current` on nav.
- Command palette as a labeled `role="dialog"` with a labeled search input and
  focus returned to the trigger on close.
- Application modal closes on Escape and moves focus into the dialog on open.
- Kanban status moves are announced through a polite `aria-live` region.
- Visible focus rings on interactive controls; icon-only buttons have labels.
- Reduced motion: a global `MotionConfig reducedMotion="user"` makes every
  Framer Motion animation honor the OS setting, plus a CSS `prefers-reduced-motion`
  block for CSS animations.

## Design system

Reusable primitives live in `components/ui/` and are built on semantic design
tokens (defined as CSS variables in `app/globals.css`, exposed through Tailwind):
`Button`, `Input`, `Textarea`, `Select` (accessible listbox), `Card`, `Badge` /
`StatusBadge`, `Skeleton`, `Tooltip`, `EmptyState`, plus `MatchScore` and
`SkillBadge` extracted during this work. Colors, spacing, radii, and focus rings
are standardized through the tokens so light and dark themes stay consistent.

## Storybook

```bash
npm run storybook        # dev server on :6006
npm run build-storybook  # static build
```

Stories cover the portfolio-relevant primitives (Button, Input/Textarea, Select,
Badge, Card, EmptyState, MatchScore, SkillBadge) with variant/state coverage and
a dark/light toolbar toggle.

## Performance

- Recharts is **code-split** via `next/dynamic` (`ssr: false`) so the dashboard's
  initial JS doesn't include the charting library; it loads on demand behind a
  skeleton.
- Heavy client deps (e.g. `@hello-pangea/dnd`) are route-scoped to the pages that
  use them.
- A production build was used to profile route/bundle sizes; no speculative
  `useMemo`/`useCallback` was added — memoization is reserved for genuinely
  expensive work.

## Getting started

```bash
npm install
cp .env.example .env    # fill in the values below
npm run prisma:generate
npm run prisma:migrate
npm run db:seed         # optional: seeds the demo workspace
npm run dev             # http://localhost:3000
```

### Environment variables

```env
# Database (Neon Postgres) — see .env.example for pooled vs direct endpoints
DATABASE_URL=
DIRECT_URL=

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# AI analysis (optional). Without a key the analyzer still works with the
# deterministic matcher; the AI panel shows "not configured".
ANTHROPIC_API_KEY=
# ANALYZE_MODEL=claude-opus-4-8   # optional model override
```

### Demo login

- Email: `demo@applyflow.dev`
- Password: `applyflow123`

## Scripts

```bash
npm run dev              # dev server
npm run build            # prisma generate + migrate deploy + next build
npm run typecheck        # tsc --noEmit
npm test                 # vitest (pure + RTL)
npm run lint             # eslint
npm run build-storybook  # static Storybook build
```

## Project structure

```
app/            routes, API handlers (/api/analyze, /api/analyses, ...), dashboard pages
components/
  ui/           design-system primitives (+ *.stories.tsx)
  dashboard/    feature components (Kanban, analyzer, history, ...)
  app/          shell, command palette, theme toggle
  providers/    QueryClient + MotionConfig + session + toaster
hooks/          TanStack Query data hooks + useCommandMenu
lib/
  ai/           provider abstraction, schema, orchestrator
  scoring.ts    deterministic match scoring (pure)
  skills.ts     deterministic skill extraction (pure)
  queryKeys.ts, api.ts, ...
prisma/         schema, migrations, seed
tests/          Vitest (pure + React Testing Library)
.storybook/     Storybook config
types/          shared types
```

## Deployment (Vercel)

1. Connect the repo to a Vercel project.
2. Add `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and
   (optionally) `ANTHROPIC_API_KEY`.
3. The build script runs `prisma migrate deploy` automatically. To apply
   migrations manually: `npx prisma migrate deploy`.
