# ApplyFlow

### AI-assisted job application tracking with transparent resume matching and structured job insights.

ApplyFlow helps job seekers manage applications, compare job descriptions against different resume versions, and understand where their experience aligns with a role.

Instead of hiding everything behind an AI-generated score, ApplyFlow separates **deterministic skill matching** from **qualitative AI analysis**, so users can see what is actually driving the result.

[**Live Demo →**](https://apply-flow-orcin.vercel.app) · [**GitHub →**](https://github.com/Drumil14/ApplyFlow) · [**Portfolio →**](https://drumilmistry.netlify.app/)

---

## Overview

Job-search tools often return a vague AI-generated match percentage without explaining where it came from.

I wanted ApplyFlow to work differently.

The primary match score is calculated deterministically from the resume and job description. Users can see:

- matched skills
- missing skills
- seniority signals
- resume improvement opportunities

Anthropic is then used as a second layer to provide qualitative context such as strengths, gaps, responsibilities, and interview topics.

If the AI layer is unavailable, the core matching experience continues to work.

---

## Features

### Resume-to-job matching

Select a saved resume, paste a job description, and receive a transparent skill match.

The analysis includes:

- skill match percentage
- matched skills
- missing skills
- seniority signal
- resume suggestions

The percentage is calculated independently from the LLM.

---

### Structured AI insights

ApplyFlow integrates the Anthropic API for deeper qualitative analysis.

AI insights include:

- role summary
- resume-supported strengths
- gaps not explicitly demonstrated
- key responsibilities
- resume opportunities
- interview topics

AI responses are returned as structured data and validated with Zod before being rendered in the interface.

The AI layer is designed to avoid inventing experience or suggesting that users claim skills they do not actually have.

---

### Upload a resume from your device

Users can add a resume directly from the Analyzer.

Two input methods are supported:

- Upload PDF
- Paste resume text

PDF text extraction happens entirely in the browser using `pdfjs-dist`.

The raw PDF file is not stored or uploaded by ApplyFlow.

Only the extracted resume text and associated metadata are sent to the application's API and persisted for future matching.

---

### Multiple resume versions

Users can maintain multiple resume versions for different types of roles.

Each resume can include:

- title
- version tag
- target role
- source filename
- extracted resume text
- detected skills

After a new resume is created, TanStack Query updates the cache and automatically selects it in the Analyzer without requiring a page refresh.

---

### Application tracking

Applications can be organized through a Kanban-style workflow.

Stages include:

- Applied
- OA
- Interview
- Final
- Offer
- Rejected

Application mutations use optimistic updates so the UI responds immediately.

If a request fails, the previous state is restored.

---

### Resume management

ApplyFlow provides a dedicated workspace for maintaining resume versions and viewing the skills detected from each resume.

This makes it easier to compare different resumes against different job descriptions instead of relying on one generic resume for every application.

---

### Analysis history

Previous match records can be revisited from the Analyzer, making it easier to review earlier role comparisons.

---

### Job application activity

ApplyFlow tracks application activity and surfaces it throughout the dashboard.

Users can review their job-search progress without manually keeping separate notes or spreadsheets.

---

## AI architecture

ApplyFlow deliberately separates deterministic analysis from AI analysis.

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
Structured    │
Response      │
     │         │
     ▼         │
Zod Validation│
     │         │
     └────┬────┘
          ▼
       UI Result
