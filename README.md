# ApplyFlow

**A full-stack job application tracker for managing applications, resume versions, and job-description matching.**

ApplyFlow helps job seekers organize their application pipeline, track resume versions, understand application outcomes, and compare their resume skills against job descriptions.

Unlike Orbit, ApplyFlow has a real server-side data layer backed by PostgreSQL and Prisma.

---

## Features

### Application tracking

Users can create and manage job applications with information including:

* Company
* Role
* Application status
* Location
* Work mode
* Salary range
* Application date
* Deadline
* Recruiter name
* Recruiter email
* Notes
* Related links
* Priority
* Resume version

Application data is persisted in PostgreSQL.

### Application CRUD

Next.js API routes provide server-side operations for:

```text
GET    /api/applications
POST   /api/applications
PATCH  /api/applications/:id
DELETE /api/applications/:id
```

Application updates also generate activity records.

### Kanban pipeline

Applications can be organized across:

```text
Applied
↓
Online Assessment
↓
Interview
↓
Final Round
↓
Offer / Rejected
```

The board uses drag-and-drop interactions to update an application's status.

Status changes are persisted through the application API.

### Dashboard

The dashboard calculates and displays information such as:

* Total applications
* Active applications
* Interviews
* Offers
* Rejection rate
* Interview conversion rate
* Offer conversion rate
* Weekly activity
* Pipeline stage distribution
* Upcoming deadlines
* Recent activity
* Resume statistics

Charts are rendered using Recharts.

### Resume version tracking

ApplyFlow stores resume versions with:

* Title
* Version tag
* File name metadata
* Target role
* Pasted resume text
* Extracted skills
* Associated applications
* Score
* Interview count
* Offer count
* Rejection count

The current application does **not parse uploaded PDF files**.

Instead, users enter file metadata and paste resume text. ApplyFlow extracts known skills from that text and stores them with the resume version.

### Job description analyzer

Users can:

1. Select a resume version
2. Paste a job description
3. Analyze the role
4. View matched skills
5. View missing skills
6. View a match score
7. View a detected seniority signal
8. Receive deterministic resume suggestions

The analysis is persisted as a `JobAnalysis` record.

### How matching works

ApplyFlow currently uses **deterministic skill matching**.

It does not call OpenAI, Anthropic, or another LLM.

The system:

```text
Resume text
    ↓
extractSkills()
    ↓
Stored normalized resume skills

Job description
    ↓
extractSkills()
    ↓
Job skills
    ↓
scoreMatch()
    ↓
Match score + matched/missing skills
```

The score is calculated from the proportion of detected job-description skills present in the selected resume.

Conceptually:

```text
score =
matched job skills
------------------ × 100
total job skills
```

Skill extraction also normalizes aliases such as:

```text
React.js → react
ReactJS  → react
Postgres → postgresql
NextJS   → next.js
Node.js  → node
```

Whole-word matching prevents incorrect matches such as matching `java` inside `javascript`.

### Activity history

ApplyFlow records application-related events including:

* New applications
* Application updates
* Status changes
* Resume additions
* Job analyses

These records power recent-activity views in the dashboard.

### Command menu

A keyboard-accessible command menu provides quick navigation between:

* Dashboard
* Applications
* Kanban board
* Analyzer
* Resume versions
* Analytics

Open it using:

```text
Ctrl/Cmd + K
```

### Themes

ApplyFlow supports light and dark interface modes.

---

## Full-Stack Architecture

```text
React / Next.js UI
        ↓
Next.js App Router
        ↓
API route handlers
        ↓
Prisma ORM
        ↓
PostgreSQL
```

ApplyFlow therefore includes the complete path from:

```text
UI → API → data access → database
```

---

## Database

ApplyFlow uses PostgreSQL through Prisma.

Main models include:

```text
User
Account
Session
VerificationToken
Application
ResumeVersion
Activity
JobAnalysis
```

Relations connect:

```text
User
 ├── Applications
 ├── Resume Versions
 ├── Activity
 └── Job Analyses
```

Applications can also reference the resume version used for that application.

### Indexes

The current Prisma schema includes indexes for frequently used fields such as:

```text
Application(userId, status)
Application(deadline)
Activity(userId, createdAt)
```

---

## Authentication

ApplyFlow includes credentials-based authentication using:

* NextAuth
* bcrypt
* Prisma
* PostgreSQL

Passwords are stored as bcrypt hashes rather than plaintext.

The application also supports an **implicit demo workspace fallback**, allowing the demo experience to operate without requiring a user to authenticate first.

So the current implementation contains real credentials authentication, while also intentionally supporting a simplified demo-user path.

---

## API Routes

The application includes route handlers for areas such as:

```text
/api/applications
/api/applications/[id]

/api/resumes
/api/resumes/[id]

/api/analyze

/api/activity

/api/auth/register
/api/auth/[...nextauth]
```

These routes handle application persistence, resume metadata, analysis records, authentication, and activity data.

---

## Testing

ApplyFlow uses **Vitest**.

The current tests cover core deterministic logic including:

### Match scoring

Tests verify:

* Zero-skill cases
* Full matches
* Partial matches
* No-overlap cases
* Percentage rounding
* Scores never exceeding 100%
* Input immutability

### Skill extraction

Tests verify:

* Skill detection
* Alias normalization
* Duplicate removal
* Case-insensitive matching
* Whole-word matching
* Punctuation-heavy technologies such as `C++`
* Framework names such as `Next.js`
* Empty input behavior

Run tests with:

```bash
npm test
```

Additional commands:

```bash
npm run test:watch
npm run test:coverage
```

---

## Tech Stack

### Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* Framer Motion
* Recharts
* Zustand
* Sonner
* Lucide React
* @hello-pangea/dnd

### Backend / Data

* Next.js Route Handlers
* Prisma
* PostgreSQL
* NextAuth
* bcrypt

### Testing

* Vitest

---

## Environment Variables

Create a `.env` file containing:

```env
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

`DATABASE_URL` is used by the application at runtime.

`DIRECT_URL` is used for direct database access such as Prisma migrations when the runtime connection uses a pooled PostgreSQL endpoint.

---

## Running Locally

Install dependencies:

```bash
npm install
```

Generate Prisma:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate
```

Optionally seed the demo workspace:

```bash
npm run db:seed
```

Start development:

```bash
npm run dev
```

---

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck

npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run db:seed

npm test
npm run test:watch
npm run test:coverage
```

---

## Project Structure

```text
app/
├── api/
└── dashboard/

components/
├── app/
├── auth/
├── dashboard/
├── landing/
├── providers/
└── ui/

lib/
├── auth.ts
├── prisma.ts
├── scoring.ts
├── skills.ts
└── session.ts

prisma/
├── migrations/
├── schema.prisma
└── seed.ts

tests/
├── scoring.test.ts
└── skills.test.ts

types/
```

---

## What ApplyFlow Does Not Currently Include

To describe the current project accurately:

* No LLM API integration
* No OpenAI/Anthropic integration
* No GraphQL
* No NestJS
* No TypeORM
* No Nx
* No Bun-based architecture
* No Python backend
* No automatic PDF resume parsing
* No external financial/job-data API integration

The current analyzer is deterministic and rule-based rather than generative AI.

---

## Project Goal

ApplyFlow demonstrates a complete full-stack product flow using React, Next.js, API route handlers, Prisma, and PostgreSQL while solving a practical workflow problem around job-search organization and resume iteration.
