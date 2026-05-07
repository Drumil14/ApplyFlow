# ApplyFlow

ApplyFlow is a production-quality full-stack job application tracker for students and software engineers. It combines application management, Kanban pipeline tracking, resume version performance, activity timelines, and AI job description analysis in a polished SaaS-style experience.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS, Framer Motion, lucide-react, Recharts, Sonner
- Prisma with PostgreSQL
- NextAuth credentials authentication
- OpenAI API with a deterministic local fallback
- Zustand for the command menu state

## Features

- Premium landing page with responsive SaaS sections, pricing, testimonials, and CTA
- Email/password sign up and login with persistent NextAuth sessions
- One-click demo login that auto-provisions a seeded workspace
- Protected dashboard and user-scoped data
- Overview statistics, weekly activity chart, interview/deadline cards, rejection and offer analytics
- CRUD job applications with notes, links, salary range, deadlines, recruiter details, and resume association
- Drag-and-drop Kanban board for Applied, OA, Interview, Final Round, Offer, and Rejected
- AI job description analyzer for skills, technologies, seniority, keywords, resume suggestions, and match score
- Resume version tracking with conversion metrics and associated applications
- Activity timeline, command menu, dark/light mode, toast notifications, skeleton states, empty states, and mobile responsive layouts

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Set `DATABASE_URL` to a PostgreSQL database and create a strong `NEXTAUTH_SECRET`.

4. Generate Prisma and run the migration:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Seed believable demo data:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

Demo login:

- Email: `demo@applyflow.dev`
- Password: `applyflow123`

The landing page "Try Live Demo" button routes to `/login?demo=true`, fills the demo credentials, and signs in automatically.
The demo workspace is generated server-side from `lib/demo.ts` and refreshes from seed data after several hours or whenever its application set is empty. No environment variables or private server configuration are sent to the browser.

## AI Analyzer

Set `OPENAI_API_KEY` to enable live OpenAI analysis. Without a key, ApplyFlow returns a deterministic local analysis so the UI and workflow still work in development and preview environments.

## Vercel Deployment

1. Create a Vercel project from this repository.
2. Add a managed PostgreSQL database, such as Vercel Postgres, Neon, Supabase, or Railway.
3. Add these environment variables in Vercel:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

4. Run Prisma migrations against production:

```bash
npx prisma migrate deploy
```

The included `vercel.json` uses `npm run build`, which runs `prisma generate` before `next build`.

## Project Structure

```text
app/
  (auth)/            login and signup routes
  api/               auth, applications, resumes, activity, and AI route handlers
  dashboard/         protected application routes
components/
  app/               dashboard shell, command menu, theme toggle
  auth/              authentication UI
  dashboard/         product workspaces
  landing/           public marketing site
  providers/         session and toast providers
  ui/                reusable primitives
lib/                 auth, prisma, session helpers, serializers, utilities
prisma/              schema and seed data
stores/              Zustand state
types/               shared product types
```

## Quality Checks

```bash
npm run typecheck
npm run build
```
