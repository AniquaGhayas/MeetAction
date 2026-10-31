# MeetAction — Build & Deployment Guide

This walks through building MeetAction from the PRD, in order: environment setup → backend → frontend integration → deployment.

---

## Phase 0 — Environment Setup

### 0.1 Install core tools
- **Node.js (LTS)** — includes npm/npx
- **PostgreSQL** (local install, or Docker container)
- **Redis** (for BullMQ job queue — local install or Docker)
- **Git**
- A code editor (VS Code, or Antigravity itself)

### 0.2 Create accounts / API keys you'll need before coding
- **Anthropic or OpenAI API key** (for LLM extraction)
- **Speech-to-text provider key** (Whisper API / Deepgram / AssemblyAI)
- **Atlassian developer app** (for Jira OAuth — create at developer.atlassian.com)
- **Trello API key** (trello.com/power-ups/admin or developer portal)
- **AWS S3 bucket (or R2/Cloudflare)** for audio/transcript file storage
- Hosting accounts for later: Railway/Render (backend), Vercel/Netlify (frontend)

### 0.3 Scaffold the repo
```
meetaction/
├── backend/           # Node.js API
├── frontend/          # React app
├── docker-compose.yml # local Postgres + Redis
└── README.md
```

---

## Phase 1 — Backend Foundation

### Step 1: Initialize the backend project
```bash
cd backend
npm init -y
npm install express typescript ts-node-dev @types/express @types/node
npx tsc --init
```
Set up `src/index.ts` with a minimal Express server and a `/health` route — confirm it runs before adding anything else.

### Step 2: Set up the database layer
- Install Prisma: `npm install prisma @prisma/client`, then `npx prisma init`
- Define the schema from the PRD's data model: `User`, `Integration`, `Meeting`, `ActionItem`
- Run `npx prisma migrate dev` to create tables locally
- Confirm you can read/write a test row before moving on

### Step 3: Set up Redis + BullMQ
```bash
npm install bullmq ioredis
```
- Create a `queues/processingQueue.ts` with a basic queue and a worker that just logs the job payload — verify a job enqueued from an API route actually reaches the worker before wiring in real logic.

### Step 4: Auth
- Implement signup/login (email+password with bcrypt + JWT, or plug in Auth0/Clerk)
- Middleware to protect routes with the logged-in user's ID

**Checkpoint:** you should now be able to register, log in, and hit a protected route returning your user ID.

---

## Phase 2 — Core Pipeline (Text → Extraction → Review)

### Step 5: Transcript input endpoint
- `POST /meetings` — accepts pasted text or uploaded `.txt`/`.docx`/`.pdf`, creates a `Meeting` row (`status: processing`), enqueues an extraction job, returns the `meeting.id` immediately

### Step 6: LLM extraction adapter
- Create `services/llmExtraction.ts` — wraps the LLM API call
- Prompt the model to return **only JSON** matching a strict schema: `[{ description, assignee, due_date, source_snippet }]`
- Validate the response against that schema (e.g., with `zod`) before trusting it — reject/retry on malformed output
- Worker: on job pickup, call this service, write `ActionItem` rows, set `Meeting.status = ready_for_review`

### Step 7: Status polling / retrieval endpoints
- `GET /meetings/:id` — returns meeting + status
- `GET /meetings/:id/items` — returns extracted action items

**Checkpoint:** paste a transcript via a tool like Postman/curl, poll until `ready_for_review`, and confirm sensible action items come back.

---

## Phase 3 — Audio Support

### Step 8: File upload + storage
- Add multipart upload handling (e.g., `multer`) for audio files
- Upload the raw audio to S3, store the URL on `Meeting`

### Step 9: STT adapter
- `services/speechToText.ts` — sends the audio file/URL to your STT provider, returns transcript text
- Worker pipeline: if `source_type === 'audio'`, call STT first, store the resulting transcript, then continue into the same extraction step from Phase 2

**Checkpoint:** upload a short audio clip end-to-end and confirm it produces action items, same as text input did.

---

## Phase 4 — Review & Edit (connects to frontend)

### Step 10: Edit endpoints
- `PATCH /items/:id` — edit description/assignee/due_date, or mark `excluded`
- `POST /meetings/:id/items` — manually add an item the AI missed

These are what the frontend's review screen will call as the user edits the list before pushing.

---

## Phase 5 — Jira & Trello Integrations

### Step 11: Jira OAuth
- Register your app at developer.atlassian.com, get client ID/secret, set redirect URI to your backend (e.g., `/auth/jira/callback`)
- `GET /auth/jira` → redirects to Atlassian consent screen
- `GET /auth/jira/callback` → exchanges code for access+refresh token, encrypts and stores on `Integration`
- `services/jiraAdapter.ts` — wraps `GET /project/search`, `GET /issuetype`, `POST /issue`

### Step 12: Trello OAuth
- Get your API key from Trello's developer portal
- Implement the token flow (Trello's simpler key+token auth, or Power-Up OAuth)
- `services/trelloAdapter.ts` — wraps `GET /members/me/boards`, `GET /boards/:id/lists`, `POST /cards`

### Step 13: Push endpoint
- `POST /meetings/:id/push` — takes the approved items + target project/board, loops through calling the right adapter per item, stores `external_id`/`external_url`, sets `ActionItem.status = pushed`
- Return per-item success/failure so partial failures are visible rather than all-or-nothing

**Checkpoint:** connect a real (test) Jira project and Trello board, push a couple of approved items, confirm real tickets/cards appear.

---

## Phase 6 — Frontend Integration

### Step 14: Scaffold the frontend
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install @tanstack/react-query axios tailwindcss
```

### Step 15: API client layer
- Create `src/api/client.ts` — an axios instance pointed at your backend base URL, with JWT attached from auth state
- One function per endpoint (`createMeeting`, `getMeeting`, `getItems`, `updateItem`, `pushItems`, etc.) — don't scatter raw `fetch` calls through components

### Step 16: Build screens in this order (so each is testable against real data as you go)
1. **Auth screens** (login/signup) → confirm JWT is stored and attached to requests
2. **New meeting screen** (paste text / upload file / record audio) → calls `POST /meetings`, redirects to a processing/status view
3. **Processing screen** → polls `GET /meetings/:id` (React Query `refetchInterval`) until `ready_for_review`
4. **Review screen** → fetches items, renders editable rows, calls `PATCH /items/:id` on edits, lets user pick Jira project / Trello board+list
5. **Push & results screen** → calls `POST /meetings/:id/push`, shows live per-item success/failure and links to created tickets/cards
6. **History screen** → lists past meetings via a `GET /meetings` list endpoint (add this to backend if not already there)
7. **Integrations settings screen** → "Connect Jira" / "Connect Trello" buttons that redirect to your OAuth start routes

### Step 17: Wire pixel-art/UI assets (if using your Aseprite/Stitch assets here)
- Drop exported PNG/sprite sheets into `src/assets/`
- Apply `image-rendering: pixelated;` on any pixel-art images
- Keep them to accent moments (empty states, success screen) per your earlier plan, not dense UI text

**Checkpoint:** a full manual run — paste a transcript, review items, push to a real test Jira/Trello, see it land — all driven from the UI, no Postman needed.

---

## Phase 7 — Hardening

### Step 18: Error handling & retries
- Wrap STT/LLM/Jira/Trello calls with retry logic (e.g., `p-retry`) for transient failures
- Make the push step idempotent (don't double-create a ticket if retried)

### Step 19: Security pass
- Encrypt `Integration` tokens at rest (e.g., `crypto` AES-256, keyed from an env secret — never commit this key)
- Enforce HTTPS-only cookies/headers
- Rate-limit the `/meetings` creation endpoint to bound LLM/STT cost

### Step 20: Tests
- Unit tests for the LLM response parser (malformed JSON, empty extraction)
- Integration tests for Jira/Trello adapters using mocked HTTP (`nock` or `msw`) so CI doesn't hit real APIs

---

## Phase 8 — Deployment

### Step 21: Containerize
- `backend/Dockerfile` — multi-stage build (install → build TS → run)
- `docker-compose.yml` for local Postgres + Redis (dev only — not used in prod hosting below)

### Step 22: Deploy the backend
- Push to Railway, Render, or AWS ECS
- Provision a managed PostgreSQL and managed Redis (e.g., Railway's own, or Upstash Redis) instead of self-hosting in prod
- Set all environment variables there: DB URL, Redis URL, LLM key, STT key, Jira/Trello client secrets, token-encryption key, S3 credentials
- Point your Jira app's and Trello app's OAuth redirect URIs at the **production** backend URL (you'll likely need a separate Atlassian app or updated redirect list vs. your local dev app)

### Step 23: Deploy the frontend
- Push to Vercel or Netlify, pointed at `frontend/`
- Set the production API base URL as a build-time env var (`VITE_API_URL`)
- Confirm CORS on the backend allows the deployed frontend's origin

### Step 24: CI/CD
- GitHub Actions workflow: on push to `main` → run tests → build → deploy backend and frontend (via Railway/Render/Vercel's GitHub integration, or explicit deploy steps)

### Step 25: Post-deploy checks
- Full OAuth connect flow against real Jira/Trello in production (not just local)
- Confirm file uploads actually land in your production S3 bucket
- Set up basic monitoring (Sentry for errors; simple uptime check on `/health`)

---

## Suggested Build Order Recap
Phase 0 → 1 → 2 (text pipeline working end-to-end via API calls only) → 3 (audio) → 4 (edit endpoints) → 5 (Jira/Trello) → 6 (frontend, screen by screen against the now-working backend) → 7 (hardening) → 8 (deploy).

Building the backend pipeline fully before touching the frontend (Phases 1–5) means every frontend screen in Phase 6 is built against real, working endpoints instead of guessing at API shapes — this avoids a lot of rework.
