# MeetAction — Product Requirements Document (PRD)

**Version:** 1.0
**Status:** Draft
**Author:** Anny

---

## 1. Overview

MeetAction is a Node.js-based web application that converts meeting transcripts (typed, pasted, uploaded, or recorded as audio) into structured, reviewable action items and pushes them directly into Jira or Trello. It eliminates the gap between "a decision was made in a meeting" and "a ticket exists to track it."

## 2. Abstract

Business meetings routinely produce decisions and action items that get lost in scattered notes, forgotten follow-ups, or manual re-entry into task trackers. MeetAction is a Node.js-based web application that automates this workflow end-to-end: users upload or paste a meeting transcript (or record audio, which is transcribed via a speech-to-text API), and a large language model analyzes the text to extract structured action items — task description, assignee (where identifiable), and due date if mentioned. The extracted items are presented for user review and can then be pushed directly into Jira or Trello via their REST APIs, creating tickets/cards in the appropriate board or project with a single click. By combining transcript processing, AI-based summarization, and third-party task-management integration, the application eliminates manual minute-taking and reduces the lag between a decision being made in a meeting and it becoming an actionable, tracked task.

## 3. Problem Statement

In fast-paced B2B environments, meetings generate numerous verbal commitments and action items that are rarely captured consistently. Manual note-taking is time-consuming, error-prone, and dependent on one person's attention and interpretation, often resulting in missed or ambiguous follow-ups. Even when notes are taken, converting them into trackable tasks in project management tools like Jira or Trello is a separate manual step that teams frequently skip or delay, leading to accountability gaps and stalled action items. There is a need for an automated system that can process meeting content, intelligently identify actionable items and their owners, and seamlessly integrate with the task-tracking tools teams already use — reducing administrative overhead and ensuring that meeting outcomes translate reliably into completed work.

## 4. Goals & Objectives

| Goal | Description |
|---|---|
| Reduce manual effort | Eliminate manual minute-taking and re-typing of tasks into trackers |
| Increase accountability | Ensure every verbal commitment becomes a tracked, assigned ticket |
| Close the time lag | Minimize the delay between meeting end and task creation |
| Preserve accuracy | Let users review/edit AI-extracted items before they become real tickets |
| Tool-agnostic integration | Support the trackers teams already use (Jira, Trello) rather than forcing a new one |

### Non-Goals (v1)
- Not a full meeting-recording/video platform (no built-in video conferencing)
- Not a replacement for Jira/Trello itself — it's a feeder into them
- No real-time (live, mid-meeting) transcription in v1 — processing happens after transcript/audio is provided
- No support for trackers beyond Jira/Trello in v1 (Asana, Linear, etc. are future work)

## 5. Target Users & Personas

- **Project/Engineering Managers** running standups, sprint reviews, and client calls who need tasks tracked without manual admin work.
- **Team Leads / Scrum Masters** who currently own the "write down and distribute action items" task.
- **Individual Contributors** who want a personal record of what they committed to.
- **Client-facing teams (sales, consulting)** who need commitments from external meetings turned into internal tickets.

## 6. User Stories

1. As a meeting organizer, I want to paste or upload a transcript so that I don't have to manually re-read it for action items.
2. As a meeting organizer, I want to upload/record audio so that I don't need a separate transcription tool.
3. As a user, I want the system to suggest task description, assignee, and due date for each action item so I don't have to write it all myself.
4. As a user, I want to review and edit extracted items before anything is created in Jira/Trello, so incorrect AI extractions don't pollute my tracker.
5. As a user, I want to select which Jira project/board or Trello board and list a task goes into.
6. As a user, I want one-click creation of all approved items as tickets/cards.
7. As a user, I want to see a history of past meetings and what was created from them.
8. As an admin, I want to connect/disconnect Jira and Trello accounts via OAuth.

## 7. Functional Requirements

### 7.1 Input & Transcription
- FR1: Accept pasted text transcripts.
- FR2: Accept uploaded transcript files (.txt, .docx, .pdf).
- FR3: Accept uploaded audio files (.mp3, .wav, .m4a) and/or in-browser audio recording.
- FR4: Send audio to a speech-to-text API and return a transcript with speaker segments where supported.
- FR5: Show transcription progress/status (queued, processing, complete, failed).

### 7.2 AI Extraction
- FR6: Send the transcript to an LLM with a structured-extraction prompt.
- FR7: Extract, per action item: task description (required), assignee (optional, best-effort from text), due date (optional, parsed to ISO date where a date/relative date is mentioned), and source snippet/timestamp for traceability.
- FR8: Return extraction as structured JSON (see Data Model) the frontend can render as an editable list.
- FR9: Handle transcripts with no clear action items gracefully (empty state, not an error).
- FR10: Support re-running extraction if the user edits the transcript.

### 7.3 Review & Edit
- FR11: Present each action item as an editable card/row: description, assignee, due date, status (include/exclude).
- FR12: Let the user add a manual action item not caught by the AI.
- FR13: Let the user delete/exclude an incorrectly extracted item.
- FR14: Let the user reassign an item to a specific Jira project/board or Trello board+list before pushing.

### 7.4 Integration — Jira
- FR15: OAuth 2.0 (3LO) connection to a user's Jira Cloud instance.
- FR16: Fetch accessible projects and issue types.
- FR17: Create an issue (default: Task) per approved action item via Jira REST API v3, mapping description → summary/description, assignee → Jira account (best-effort match by name/email), due date → due date field.
- FR18: Return created issue links back to the UI.

### 7.5 Integration — Trello
- FR19: OAuth (API key + token or Power-Up auth) connection to a user's Trello account.
- FR20: Fetch accessible boards and lists.
- FR21: Create a card per approved action item via Trello REST API, mapping description → card name/desc, assignee → member (best-effort match), due date → card due field.
- FR22: Return created card links back to the UI.

### 7.6 History & Persistence
- FR23: Store each processed meeting: raw transcript, extracted items, edits, and push results (ticket/card IDs and links).
- FR24: List past meetings with search/filter by date and keyword.
- FR25: Allow re-opening a past meeting to view what was created.

### 7.7 Auth & Accounts
- FR26: User authentication (email/password or OAuth login).
- FR27: Per-user storage of Jira/Trello connection tokens (encrypted at rest).
- FR28: Ability to disconnect an integration.

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Transcript extraction for a 60-minute meeting (~8–10k words) should complete in under 30 seconds (excluding audio transcription time) |
| Scalability | Support concurrent processing jobs via a queue so one long transcript doesn't block others |
| Security | Encrypt integration tokens at rest (e.g., AES-256); all API traffic over HTTPS; never log raw tokens |
| Reliability | Retry logic for transient failures calling STT/LLM/Jira/Trello APIs; jobs must be resumable/idempotent |
| Privacy | Transcripts may contain sensitive business info — support per-meeting deletion and configurable data retention |
| Usability | Review screen must make it obvious what will be created and where, before the user commits |
| Auditability | Every created ticket/card is traceable back to the source meeting and transcript snippet |
| Cost control | Cap max transcript length / audio duration per job to bound LLM and STT API cost |

## 9. System Architecture

### 9.1 High-Level Architecture

```
┌───────────────┐      ┌────────────────────┐      ┌───────────────────┐
│   Frontend     │◄────►│   Backend API       │◄────►│   PostgreSQL DB    │
│ (React SPA)    │ REST │ (Node.js/Express)   │      │ (users, meetings,  │
└───────────────┘      └─────────┬───────────┘      │  items, tokens)    │
                                  │                   └───────────────────┘
                                  │
                    ┌─────────────┼──────────────┬───────────────┐
                    ▼             ▼              ▼               ▼
             ┌────────────┐ ┌───────────┐ ┌─────────────┐ ┌─────────────┐
             │ STT API     │ │ LLM API    │ │ Jira REST   │ │ Trello REST │
             │ (Whisper/   │ │ (Claude/   │ │ API v3      │ │ API         │
             │ Deepgram)   │ │ GPT)       │ │             │ │             │
             └────────────┘ └───────────┘ └─────────────┘ └─────────────┘

             ┌────────────────────────────┐
             │ Job Queue (BullMQ + Redis) │  ← async STT/LLM jobs
             └────────────────────────────┘
```

### 9.2 Component Breakdown

- **Frontend (React SPA):** Upload/record UI, transcript viewer, editable action-item review table, integration settings, meeting history.
- **Backend API (Node.js/Express or Fastify):** Auth, file upload handling, job orchestration, business logic, REST endpoints consumed by the frontend.
- **Job Queue (BullMQ on Redis):** Decouples long-running STT/LLM calls from the request/response cycle; enables retries and progress tracking.
- **STT Service Adapter:** Thin wrapper so the STT provider (e.g., OpenAI Whisper API, Deepgram, AssemblyAI) can be swapped without touching business logic.
- **LLM Extraction Service Adapter:** Wraps prompt construction, model call, and response parsing/validation (e.g., via a JSON schema) so the LLM provider is swappable.
- **Integration Adapters (Jira, Trello):** Encapsulate OAuth flows, token refresh, and REST calls; expose a common internal interface (`createTicket(item, target)`), so adding a new tracker later means adding one more adapter.
- **Database (PostgreSQL):** Source of truth for users, meetings, transcripts, extracted items, edits, and integration tokens.
- **Object Storage (S3-compatible):** Stores uploaded audio/transcript files.

### 9.3 Data Model (simplified)

```
User
 ├─ id, email, password_hash / oauth_id, created_at

Integration
 ├─ id, user_id, provider (jira|trello), access_token (enc), refresh_token (enc),
 │  instance_url (jira) / api_key (trello), connected_at

Meeting
 ├─ id, user_id, title, source_type (text|file|audio),
 │  raw_transcript, audio_file_url, status, created_at

ActionItem
 ├─ id, meeting_id, description, assignee_raw, assignee_resolved_id,
 │  due_date, source_snippet, status (pending|approved|excluded|pushed),
 │  pushed_to (jira|trello|null), external_id, external_url
```

### 9.4 Processing Flow (Job Pipeline)

1. Client submits text, file, or audio.
2. Backend stores raw input, creates a `Meeting` record (status: `processing`), enqueues a job.
3. **If audio:** worker calls STT API → transcript text → stored on `Meeting`.
4. Worker calls LLM extraction service with the transcript → structured JSON of candidate action items.
5. Worker validates/parses JSON, creates `ActionItem` rows (status: `pending`), sets `Meeting.status = ready_for_review`.
6. Frontend polls/subscribes for status, then renders the review screen.
7. User edits/approves items client-side (draft state), then submits approved set.
8. Backend maps approved items to selected Jira project or Trello board/list, calls the relevant integration adapter per item.
9. Backend stores returned external ticket/card IDs and links; sets `ActionItem.status = pushed`.
10. UI shows confirmation with clickable links to created tickets/cards.

## 10. Application Flow (User Journey)

1. **Sign up / Log in**
2. **Connect integrations** (Jira and/or Trello) via OAuth — optional at this point, required before pushing items
3. **Start a new meeting entry**
   - Choose input method: paste text / upload transcript file / upload or record audio
4. **Processing screen** — shows transcription (if audio) then extraction progress
5. **Review screen** — editable list of extracted action items (description, assignee, due date), with add/remove controls; select target Jira project or Trello board+list (globally or per item)
6. **Push confirmation** — user clicks "Create Tickets"; progress indicator per item
7. **Results screen** — list of created tickets/cards with direct links; any failures flagged with retry option
8. **History** — meeting appears in the user's meeting list with a link back to its results

## 11. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), TypeScript, TailwindCSS, React Query for data fetching |
| Backend | Node.js, Express (or Fastify), TypeScript |
| Job Queue | BullMQ + Redis |
| Database | PostgreSQL (via Prisma ORM) |
| File/Audio Storage | AWS S3 (or S3-compatible, e.g., Cloudflare R2) |
| Speech-to-Text | OpenAI Whisper API / Deepgram / AssemblyAI (pluggable adapter) |
| LLM Extraction | Anthropic Claude API / OpenAI GPT API (pluggable adapter, structured/JSON output) |
| Task Tracker APIs | Jira REST API v3 (OAuth 2.0 3LO), Trello REST API (API key + OAuth token) |
| Auth | JWT-based sessions, or Auth0/Clerk for managed auth |
| Hosting | Docker containers; Render/Railway/AWS ECS for backend, Vercel/Netlify or S3+CloudFront for frontend |
| Monitoring | Sentry (errors), basic logging via Pino, optional Prometheus/Grafana |
| CI/CD | GitHub Actions |

## 12. Third-Party API Integration Notes

### Jira
- Use OAuth 2.0 (3-legged) via `auth.atlassian.com`; store refresh tokens and refresh access tokens as needed.
- Use `/rest/api/3/issue` (POST) to create issues; `/rest/api/3/project/search` and `/rest/api/3/issuetype` to populate project/type pickers.
- Assignee resolution: match extracted name/email against `/rest/api/3/user/search`; fall back to leaving unassigned with the raw name noted in the description if no confident match.

### Trello
- Use Trello's API key + OAuth token flow (or Power-Up token).
- Use `/1/boards/{id}/lists` and `/1/members/me/boards` to populate pickers.
- Use `POST /1/cards` to create cards, setting `idList`, `name`, `desc`, `due`, `idMembers`.
- Assignee resolution: match extracted name against board members via `/1/boards/{id}/members`.

## 13. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| LLM misidentifies action items or assignees | Mandatory human review step before anything is pushed; confidence flags on uncertain fields |
| STT inaccuracy on poor audio/accents | Allow manual transcript edit before extraction; support re-processing |
| Jira/Trello API rate limits | Queue pushes, batch with backoff, surface partial failures clearly |
| Sensitive meeting content | Encryption at rest, configurable retention/deletion, no third-party logging of raw transcripts |
| OAuth token expiry/revocation | Refresh-token flow with clear re-connect prompts on failure |

## 14. Milestones (Suggested)

1. **M1 — Core pipeline:** Text/transcript input → LLM extraction → review UI (no integrations)
2. **M2 — Audio support:** Upload/record → STT → feeds into M1 pipeline
3. **M3 — Jira integration:** OAuth connect, project picker, issue creation
4. **M4 — Trello integration:** OAuth connect, board/list picker, card creation
5. **M5 — History, polish, retries, and error handling**
6. **M6 — Auth hardening, encryption, retention controls**

## 15. Open Questions

- Should due-date parsing support relative phrases ("by next Friday") — likely yes, needs a date-normalization step tied to meeting date.
- Single global target board/project per meeting, or per-item targets? (Spec above assumes per-item flexibility.)
- Multi-tenant/team accounts (shared meeting history) vs. single-user accounts for v1?
- Which STT and LLM providers to lock in for v1 based on cost/accuracy trade-offs?
