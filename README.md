# MeetAction

MeetAction turns messy meeting audio and transcripts into structured Jira issues and Trello cards with one click.

## Project Structure

```
meetaction/
├── backend/            # Express + TypeScript API, Prisma ORM, BullMQ queue
├── frontend/           # React + Vite + Tailwind CSS SPA
├── docs/               # PRD and step-by-step build guides
│   ├── MeetAction-PRD.md
│   └── MeetAction-Build-Guide.md
├── docker-compose.yml  # Local PostgreSQL and Redis containers
├── .env.example        # Environment variable template
├── .gitignore          # Git exclusion rules (.env prioritized)
└── README.md           # Project documentation
```

## Phase 0: Core Tools & Prerequisites

1. **Node.js (v20+ LTS)**: JavaScript runtime for the backend API and frontend build tooling.
2. **Git**: Distributed version control system.
3. **PostgreSQL (v16)**: Primary relational database for users, meetings, action items, and encrypted integration tokens.
4. **Redis (v7)**: In-memory data store powering the BullMQ background queue for asynchronous STT transcription and LLM extraction jobs.
5. **Docker & Docker Compose** *(Recommended for Windows)*: Runs containerized PostgreSQL and Redis locally with zero configuration.

## Getting Started

### 1. Start Local Databases (PostgreSQL + Redis)

Using Docker Compose:
```bash
docker compose up -d
```

*Alternative for Windows without Docker:*
- Use a managed cloud database such as [Neon](https://neon.tech) / [Supabase](https://supabase.com) for PostgreSQL and [Upstash](https://upstash.com) for Redis.
- Or install PostgreSQL directly using the Windows installer and run Redis via WSL2 / Memurai.

### 2. Configure Environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure database credentials match your local or hosted PostgreSQL and Redis instances.

