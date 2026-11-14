# MeetAction 🎙️⚡

> Converts meeting recordings (audio clips, microphone stream, uploaded files, or text transcripts) into structured action items with assignee & due-date detection, and syncs them to Jira and Trello.

---

## 🚀 Architecture & Phase Execution

MeetAction implements the end-to-end pipeline specified in [MeetAction-PRD.md](file:///c:/projects/MeetAction/MeetAction-PRD.md) and [MeetAction-Build-Guide.md](file:///c:/projects/MeetAction/MeetAction-Build-Guide.md):

### Phase 1 & 2: Backend Foundation & Core Pipeline
- **Express + TypeScript REST API** with modular routing, CORS, and health monitoring (`/api/health`).
- **Database & Persistence Layer** (`backend/src/db/index.ts`): Stores users, meetings, action items, transcript turns, and OAuth integrations.
- **Queue Pipeline** (`backend/src/queues/processingQueue.ts`): Handles background async pipeline processing (`queued` → `transcribing` → `extracting` → `ready_for_review`).
- **LLM Extraction Adapter** (`backend/src/services/llmExtraction.ts`): Extracts action items, assignees, deadlines, and source snippets with OpenAI / Claude / Gemini integration plus semantic rule-based extraction fallback.

### Phase 3: Audio Support
- **Step 8 (File Upload & Storage)**:
  - Multipart upload handler (`multer`) supporting `.mp3`, `.wav`, `.m4a`, `.webm`, `.ogg`, `.flac`, `.aac`.
  - Storage adapter (`backend/src/services/storage.ts`) saves raw audio in `backend/uploads/audio/` and attaches `audioFileUrl` to the `Meeting`.
  - Static file serving configured on Express at `/uploads`.
- **Step 9 (Speech-to-Text Adapter)**:
  - `backend/src/services/speechToText.ts` sends audio to STT providers (OpenAI Whisper API, Deepgram, AssemblyAI) with intelligent local audio synthesis fallback.
  - Worker pipeline detects `source_type === 'audio'`, calls STT first to produce speaker turns with timestamps, then feeds into the LLM extraction pipeline.

### Phase 5: Jira & Trello Integrations
- **Step 11 (Jira OAuth & REST API v3 Adapter)**:
  - `backend/src/services/jiraAdapter.ts` handles project search (`/rest/api/3/project/search`), issue type resolution, and ticket creation (`POST /rest/api/3/issue`).
  - OAuth 3LO endpoints: `GET /api/auth/jira` and `GET /api/auth/jira/callback`.
- **Step 12 (Trello OAuth & REST API Adapter)**:
  - `backend/src/services/trelloAdapter.ts` handles boards retrieval (`/1/members/me/boards`), list selection (`/1/boards/{id}/lists`), and card creation (`POST /1/cards`).
  - Trello auth endpoints: `GET /api/auth/trello` and `GET /api/auth/trello/callback`.
- **Step 13 (Push Endpoint & Granular Reporting)**:
  - `POST /api/meetings/:id/push` routes approved items to their target tracker (Jira or Trello).
  - Reports granular per-item creation status, external IDs, and links (`CORE-104`, `TRELLO-42`) so partial failures are non-blocking.
  - Updates `ActionItem.status = 'pushed'` and sets `Meeting.status = 'synced'`.

### Frontend Integration (Simultaneous Connection)
- **API Client Layer** (`frontend/src/api/client.ts`): Typed API client connected to backend endpoints.
- **Vite Proxy** (`frontend/vite.config.ts`): Automatically forwards `/api/*` and `/uploads/*` to `http://localhost:5000`.
- **Capture & Ingestion** (`frontend/src/components/dashboard/CaptureIngestView.tsx`):
  - **Live Microphone Recording**: Uses browser `MediaRecorder` API to capture real-time audio blobs.
  - **Audio File Upload**: Drag-and-drop or select any audio file to send via multipart upload.
  - **Paste Transcript**: Direct text ingestion.
  - **Realtime Status Polling**: Displays live pipeline progress badges during STT transcription and LLM extraction.
- **Review Workbench** (`frontend/src/components/dashboard/TranscriptReviewView.tsx`):
  - Plays the uploaded or recorded meeting audio directly in browser.
  - Displays transcript turns with speaker badges and quote highlights.
  - Allows editing action item title, assignee, and due date in real time (`PATCH /api/items/:id`).
  - Allows toggling include / exclude status and adding manual action items (`POST /api/meetings/:id/items`).
  - One-click ticket sync to Jira and Trello (`POST /api/meetings/:id/push`).
- **Meeting Archives & Metrics** (`MeetingsTable.tsx`, `MetricCards.tsx`):
  - Fetches real meeting records and sync statistics from `GET /api/meetings` and `GET /api/stats`.

---

## 🛠️ Getting Started

### 1. Install & Build
```bash
# Build backend and frontend
npm run build
```

### 2. Configure Environment (Optional)
In `backend/.env`:
```env
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_key_here     # (Optional: for live Whisper & GPT-4o-mini)
ANTHROPIC_API_KEY=your_key_here  # (Optional: for Claude 3.5)
```

### 3. Start Development Servers
In two terminal tabs:
```bash
# Terminal 1: Start Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Start Frontend UI (Port 5173)
npm run dev:frontend
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing Checkpoints
To verify Phase 3 (audio upload, STT, and extraction):
```bash
npm run test:phase3
```

To verify Phase 5 (Jira & Trello OAuth, adapters, and push endpoint):
```bash
npm run test:phase5
```
