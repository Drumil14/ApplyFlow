# UI Replay

UI Replay is a full-stack developer tool for recording user interactions on a webpage and replaying them with visual fidelity. It captures pointer movement, clicks, scrolling, and input changes into timestamped sessions, then replays those sessions with a custom cursor, smooth timeline controls, click effects, target highlighting, and behavioral insights.

The app is built as a polished portfolio product rather than a minimal demo. It uses Next.js App Router, React, Tailwind CSS, Next.js API routes, and lightweight JSON file storage.

## Features

- Records mouse movement with throttling for performance
- Captures clicks, scroll positions, and input changes
- Stores events in sessions with unique IDs and timestamps
- Saves and fetches sessions through Next.js API routes
- Replays sessions with smooth cursor interpolation
- Shows click pulse effects and interacted-element highlights
- Replays input typing visually
- Supports play, pause, restart, timeline scrubbing, and 1x or 2x playback speed
- Displays session metadata including duration and event count
- Generates insights for clicked areas, repeated clicks, idle time, interaction density, viewport bias, and input activity
- Uses a dark, modern developer-tool interface
- Runs locally with JSON-backed storage and no heavy external libraries

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Next.js API routes
- JSON file storage

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

## Project Structure

```text
app/
  api/
    sessions/
      [id]/
        route.ts
      route.ts
  globals.css
  layout.tsx
  page.tsx

components/
  CaptureSurface.tsx
  InsightsPanel.tsx
  PlaybackControls.tsx
  RecorderPanel.tsx
  ReplayPanel.tsx
  SessionSidebar.tsx
  StatPill.tsx
  UIReplayApp.tsx

hooks/
  useRecorder.ts
  useReplay.ts

lib/
  ids.ts
  insights.ts
  storage.ts
  time.ts
  types.ts
```

## How It Works

The recorder attaches interaction handlers to an embedded product surface. While recording, it collects normalized events with timestamps relative to the start of the session. Mouse movement is throttled so the replay remains smooth without flooding storage.

Saved sessions are posted to `/api/sessions`, where they are persisted in `data/db.json`. The replay view fetches stored sessions, reconstructs state at the current timeline position, interpolates cursor movement between pointer events, updates scroll position smoothly, restores input values, and highlights recently interacted targets.

The insights engine analyzes the event stream and surfaces practical signals such as repeated clicks, interaction density, idle time before the first meaningful action, and which part of the interface received the most attention.

## API Routes

### `GET /api/sessions`

Returns all saved sessions with metadata.

### `POST /api/sessions`

Creates a new session from a list of recorded events.

### `GET /api/sessions/:id`

Returns a single session with all replay events.

## Storage

UI Replay uses a lightweight JSON database stored at:

```text
data/db.json
```

The file is generated automatically when the app first reads or writes session data. It is ignored by Git so local recordings do not pollute the repository.

On Netlify, the demo falls back to serverless in-memory storage so API routes do not rely on a writable filesystem. Local development uses the JSON file workflow.

## Netlify Deployment

The project includes `netlify.toml` with the standard Next.js build settings. Netlify automatically applies its current OpenNext adapter during deployment.

Use these settings on Netlify:

```text
Build command: npm run build
Publish directory: .next
```

The API routes are handled by Netlify's automatic Next.js adapter.

## Notes

This project intentionally avoids heavy analytics, replay, or animation libraries. The recording and playback logic is implemented with React state, browser event handlers, requestAnimationFrame, and simple API persistence.
