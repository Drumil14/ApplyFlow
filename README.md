# ApplyFlow

A job application tracker. Keep applications organized on a Kanban board, track
resume versions, and score how well a resume matches a job description.

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth (email/password)
- Zustand, Recharts, Framer Motion
- Vitest for tests

## Features

- Kanban board for applications across Applied, OA, Interview, Final Round, Offer, and Rejected
- Application details: statuses, recruiter notes, links, salary ranges, deadlines
- Resume versions, each tied to the applications it was used for
- Match analyzer: paste a job description, pick a resume version, and get a match
  score plus matched/missing skills. Matching is done locally with a skills
  dictionary — no external API or LLM.
- Dashboard with activity and outcome charts
- Dark/light themes, command palette, keyboard shortcuts

## Getting started

```bash
npm install
cp .env.example .env
```

Set the values in `.env`:

```env
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

Then set up the database and run the app:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed        # optional: seeds the demo workspace
npm run dev
```

Open http://localhost:3000.

## Demo login

- Email: `demo@applyflow.dev`
- Password: `applyflow123`

The demo workspace seeds sample applications, resumes, and activity.

## Scripts

```bash
npm run dev         # start the dev server
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm test            # run the vitest suite
npm run lint        # eslint
```

## How the match score works

Resume text is stored per version and reduced to a normalized list of skills at
upload time (`lib/skills.ts`). When you analyze a job description, its skills are
extracted the same way and compared against the resume's skills
(`lib/scoring.ts`):

```
score = round(100 * matched / total job-description skills)
```

Both files are pure and covered by tests in `tests/`.

## Deployment (Vercel)

1. Connect the repository to a Vercel project.
2. Add `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.
3. Apply migrations against the production database:

```bash
npx prisma migrate deploy
```

## Project structure

```
app/          routes, API handlers, dashboard pages
components/   UI and feature components
lib/          scoring, skills, auth, prisma helpers
prisma/       schema, migrations, seed
tests/        unit tests
types/        shared types
```
