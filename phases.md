# Brainyfy — Phase-Wise Development Plan

> Company Brain MVP → Production
> Stack: Next.js 14 · FastAPI · PostgreSQL (Neon) · Pinecone · Neo4j (AuraDB) · Google Gemini + text-embedding-004

---

## Overview

| Phase | Name | Goal | Timeline |
|---|---|---|---|
| 0 | Foundation Setup | Infra, env, DB connections working | Day 1 — Morning |
| 1 | Core Ingestion | Upload → AI tags → Knowledge list | Day 1 — Afternoon |
| 2 | Intelligence | Ask question → cited answer + graph | Day 2 |
| 3 | Playbooks | Topic → runnable SOP from knowledge | Day 3 / Stretch |
| 4 | Polish & Demo | Demo flow clean, pitch-ready | Final hours |
| 5 | Post-Hackathon | Connectors, RBAC, personal track | Week 2+ |

---

## Phase 0 — Foundation Setup
**Goal:** All services connected, server running, auth working end-to-end.

### Backend
- [ ] Init FastAPI project (`server/`) with folder structure
- [ ] `config.py` — Pydantic settings loading all `.env` vars
- [ ] `db/session.py` — SQLAlchemy async engine (Neon PostgreSQL)
- [ ] `db/neo4j.py` — Neo4j AuraDB driver singleton
- [ ] Alembic init + first migration (orgs, users tables)
- [ ] Auth router — `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- [ ] JWT HTTP-only cookie flow (bcrypt + python-jose)
- [ ] CORS configured for `http://localhost:3000`
- [ ] Health check `GET /health` → `{ status: "ok" }`

### Frontend
- [ ] Init Next.js 14 App Router project (`client/`)
- [ ] Tailwind CSS configured
- [ ] `lib/api.ts` — fetch wrapper with `credentials: 'include'`
- [ ] `middleware.ts` — redirect `/login` if no `access_token` cookie
- [ ] `/register` page — name, email, password, org name
- [ ] `/login` page
- [ ] `useAuth` hook
- [ ] Protected layout shell — sidebar + topbar (empty nav items ok)

### Infra
- [ ] Neon.tech — PostgreSQL project created, `DATABASE_URL` in `.env`
- [ ] app.pinecone.io — index `brainyfy` created, `dimension=768`, metric=`cosine`
- [ ] console.neo4j.io — AuraDB Free instance created, credentials saved
- [ ] Google AI Studio — `GOOGLE_API_KEY` generated (covers Gemini + embeddings)

### Done when
> `POST /auth/register` creates org + user, sets cookie. Frontend redirects to `/dashboard`. `/auth/me` returns user.

---

## Phase 1 — Core Ingestion
**Goal:** User uploads text/file → AI auto-tags and titles it → appears in knowledge list.

### Backend
- [ ] `models/knowledge.py` — SQLAlchemy `KnowledgeItem` model
- [ ] Alembic migration for `knowledge_items` table
- [ ] `services/embeddings.py` — `get_embedding(text)` via Google `text-embedding-004`
- [ ] `services/ingestion.py` pipeline:
  - `parse()` — extract text from PDF (pypdf) / plain paste / URL scrape (httpx)
  - `chunk()` — 512-token chunks, 50-token overlap
  - `embed()` — embed each chunk via Google
  - `pinecone_upsert()` — store vectors with `{org_id, item_id}` metadata
  - `auto_tag()` — Gemini: return 3–5 topic tags as JSON array
  - `auto_title()` — Gemini: generate title max 8 words
  - `postgres_save()` — save `KnowledgeItem` row
- [ ] `routers/knowledge.py`:
  - `POST /knowledge` — accepts `content` (text), `url`, or `file` upload
  - `GET /knowledge` — list all items for org (from JWT)
  - `GET /knowledge/:id` — single item detail
  - `DELETE /knowledge/:id`

### Frontend
- [ ] `/dashboard` — org name, knowledge count, recent items
- [ ] `/knowledge` — `KnowledgeList` component with `KnowledgeCard`
- [ ] `UploadModal` — tabs: Paste Text · Upload File · URL
- [ ] `TagFilter` — filter knowledge list by tag
- [ ] `useKnowledge` hook — fetch, upload, delete
- [ ] `/knowledge/[id]` — item detail: title, content, tags, source

### Done when
> User pastes a Slack thread or uploads a PDF → sees it appear in knowledge list with AI-generated title and tags.

---

## Phase 2 — Intelligence Layer
**Goal:** Ask any question → get a cited answer from org knowledge. Graph shows auto-linked nodes.

### Backend
- [ ] `services/rag.py` — RAG pipeline:
  1. `embed(question)` → vector
  2. `pinecone.query(vector, top_k=5, filter={org_id})`
  3. Fetch `KnowledgeItem`s from Postgres by `pinecone_id`
  4. Build prompt — system: answer only from provided knowledge, cite sources
  5. Gemini LLM call → answer
  6. Extract cited item IDs
  7. Return `{ answer, citations: [{id, title, excerpt}] }`
- [ ] `routers/chat.py` — `POST /chat { question }` → `{ answer, citations[] }`
- [ ] `services/linker.py` — auto-linker (runs after every upload):
  1. Embed new item
  2. `pinecone.query(top_k=10, filter={org_id})`
  3. For results with `score > 0.75` → create Neo4j edge
  4. `neo4j.upsert_node(item_id, title, tags)`
- [ ] `services/graph_store.py` — Neo4j node + edge operations
- [ ] `routers/graph.py` — `GET /graph` → `{ nodes: GraphNode[], links: GraphEdge[] }`

### Frontend
- [ ] `/chat` page — `ChatWindow` + `ChatMessage` + `CitationChip` components
- [ ] `useChat` hook — POST question, stream or await answer
- [ ] Citation chips — clickable, links to `/knowledge/[id]`
- [ ] `/graph` page — `GraphCanvas` with `react-force-graph`
- [ ] `NodeTooltip` — hover shows title + tags
- [ ] `useGraph` hook

### Done when
> Ask "how do we handle refund requests?" → get a cited answer with source chips. Graph page shows nodes connected by similarity.

---

## Phase 3 — Playbooks (Stretch Goal)
**Goal:** Enter a topic → AI generates a runnable step-by-step SOP from company knowledge.

### Backend
- [ ] `models/playbook.py` — `Playbook` + `PlaybookStep` SQLAlchemy models
- [ ] Alembic migration for `playbooks` + `playbook_steps` tables
- [ ] `services/playbook_gen.py`:
  1. `pinecone.query(embed(topic), top_k=10, filter={org_id})`
  2. Fetch top chunks from Postgres
  3. Gemini prompt: "Generate step-by-step runnable SOP for: {topic}. Cite source for each step."
  4. Parse response → `PlaybookStep[]`
  5. Save to Postgres
- [ ] `routers/playbooks.py`:
  - `POST /playbooks/generate { topic }` → `PlaybookOut`
  - `GET /playbooks` → `PlaybookOut[]`
  - `GET /playbooks/:id` → `PlaybookOut` with steps
  - `PATCH /playbooks/:id/steps/:sid { completed: bool }` → `StepOut`

### Frontend
- [ ] `/playbooks` page — `PlaybookCard` list + generate button
- [ ] `/playbooks/[id]` — step list with checkboxes, citation per step
- [ ] `usePlaybooks` hook
- [ ] Generate modal — enter topic → spinner → redirect to playbook

### Done when
> Type "engineer on-call incident response" → get a 7-step runnable SOP with each step citing the source document it came from.

---

## Phase 4 — Polish & Demo Prep
**Goal:** Demo flow is clean, fast, and pitch-ready.

### 3-Screen Demo Flow
1. **Upload** — paste a Slack thread or internal doc → watch it get tagged instantly
2. **Ask** — type a question → get cited answer from the uploaded knowledge
3. **Graph** — show nodes auto-connected by topic similarity

### Polish tasks
- [ ] Loading states on all async actions (spinner, skeleton cards)
- [ ] Empty states — "No knowledge yet. Upload your first doc."
- [ ] Error handling — toast notifications on API failures
- [ ] Mobile-responsive layout (at minimum dashboard + chat)
- [ ] Seed data script — `server/scripts/seed.py` with 5–10 realistic knowledge items for demo
- [ ] `/settings` page (minimal) — org name, member list
- [ ] Vercel deployment (frontend)
- [ ] Railway/Render deployment (backend)

### Done when
> Full demo runs without errors. Upload → Ask → Graph flow takes under 60 seconds end to end.

---

## Phase 5 — Post-Hackathon (Production Roadmap)

### Connectors (replace manual upload)
- [ ] Slack OAuth — ingest channels, threads, DMs
- [ ] Gmail / Outlook — ingest threads by label
- [ ] Notion — ingest pages + databases
- [ ] Google Drive — ingest Docs, Sheets summaries
- [ ] Jira — ingest tickets + comments
- [ ] Webhook sync — incremental updates, not full re-ingestion

### Access Control
- [ ] RBAC — Admin / Member / Viewer roles
- [ ] Project-scoped knowledge — team sees only their namespace
- [ ] Per-item visibility: public to org / team-only / private

### Performance
- [ ] Celery + Redis — async ingestion queue (no more sync blocking)
- [ ] Refresh tokens — short-lived access + long-lived refresh
- [ ] Pagination — cursor-based on knowledge list
- [ ] Batch embeddings — embed multiple chunks in one API call

### Agent API (Phase 3 vision)
- [ ] `GET /playbooks/:id/export` → machine-readable SOP
- [ ] `POST /agent/query { question, context }` — AI agents call Brainyfy as a skill
- [ ] MCP server wrapper — Memory Store / Claude Code compatible

### Personal Track (Trojan Horse)
- [ ] Individual knowledge graph — Redis-fast personal second brain
- [ ] Invite flow — personal user invites team → becomes org brain
- [ ] Same AI core, separate namespace

### Analytics
- [ ] Knowledge gap detection — questions asked with no good answer
- [ ] Coverage score — % of org knowledge documented
- [ ] Usage dashboard — most queried topics, stalest docs

---

## Environment Variables — Complete Reference

```bash
# PostgreSQL (Neon)
DATABASE_URL=postgresql+asyncpg://user:pass@ep-xxx.neon.tech/brainyfy?ssl=require

# Neo4j (AuraDB Free)
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-aura-password

# Pinecone
PINECONE_API_KEY=pcsk_xxxxxxxxxxxx
PINECONE_INDEX_NAME=brainyfy
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1

# Google (Gemini + Embeddings — same key)
GOOGLE_API_KEY=AIza_xxxxxxxxxxxx

# Auth
JWT_SECRET_KEY=make-this-long-random-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=7

# App
FRONTEND_URL=http://localhost:3000
```

---

## Dependency Map

```
Phase 0 (Auth + Infra)
    ↓
Phase 1 (Ingestion) — needs: Postgres, Pinecone, Google Embeddings
    ↓
Phase 2 (Intelligence) — needs: Pinecone vectors, Neo4j, Gemini LLM
    ↓
Phase 3 (Playbooks) — needs: RAG pipeline from Phase 2
    ↓
Phase 4 (Polish) — needs: all above working
    ↓
Phase 5 (Production) — post-hackathon
```

---

*Brainyfy Phase-Wise Plan — May 2026*