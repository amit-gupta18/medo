# Brainyfy — Project Scaffold v2
> Company Brain · Client-Server Architecture · Phase-wise build plan
> Last updated: May 2026

---

## Stack (Final, Locked)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 14 (App Router) + React + Tailwind | Client — runs on Vercel |
| Backend | FastAPI (Python) | Server — runs on Railway/Render |
| LLM | OpenRouter API | Drop-in OpenAI-compatible API. Use any model (Claude, GPT-4o, Mixtral, etc.) |
| Vector DB | Pinecone | Semantic similarity search per org namespace |
| Graph DB | Neo4j | Knowledge node connections + relationship traversal |
| Relational DB | PostgreSQL + Prisma | Users, orgs, knowledge items, playbooks. Prisma as ORM + migrations |
| Auth | Custom JWT (HTTP-only cookies) | No third-party. Access token + refresh token. bcrypt for passwords. |
| Graph UI | react-force-graph | WebGL-powered force-directed graph |
| Architecture | Client-Server (no monorepo) | Two separate repos or two folders: /client + /server |

---

## Project Root Structure

```
brainyfy/
├── client/       # Next.js frontend
└── server/       # FastAPI backend
```

No shared packages. Types are duplicated or manually kept in sync between client and server. Keep it simple.

---

## Full File Structure

```
brainyfy/
│
├── client/                              # ── FRONTEND (Next.js 14)
│   ├── app/
│   │   ├── layout.tsx                   # [P1] Root layout, font, global CSS
│   │   ├── page.tsx                     # [P1] Redirect → /login or /dashboard
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # [P1] Login form
│   │   │   └── register/
│   │   │       └── page.tsx             # [P1] Register form (name, email, password, org name)
│   │   └── (app)/
│   │       ├── layout.tsx               # [P1] Protected layout — sidebar + topbar
│   │       ├── dashboard/
│   │       │   └── page.tsx             # [P1] Org home — stats, recent items
│   │       ├── knowledge/
│   │       │   ├── page.tsx             # [P1] All knowledge items list
│   │       │   └── [id]/
│   │       │       └── page.tsx         # [P1] Single item detail + related items
│   │       ├── chat/
│   │       │   └── page.tsx             # [P2] Ask the org brain
│   │       ├── graph/
│   │       │   └── page.tsx             # [P2] Visual knowledge graph (force-directed)
│   │       ├── playbooks/
│   │       │   ├── page.tsx             # [P3] All playbooks list
│   │       │   └── [id]/
│   │       │       └── page.tsx         # [P3] Single playbook — steps + citations
│   │       └── settings/
│   │           └── page.tsx             # [P3] Org settings, members, integrations
│   │
│   ├── components/
│   │   ├── ui/                          # Primitive design system
│   │   │   ├── Button.tsx               # [P1]
│   │   │   ├── Input.tsx                # [P1]
│   │   │   ├── Card.tsx                 # [P1]
│   │   │   ├── Badge.tsx                # [P1]
│   │   │   ├── Modal.tsx                # [P1]
│   │   │   └── Spinner.tsx              # [P1]
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx              # [P1] Nav links, org name, user menu
│   │   │   └── Topbar.tsx               # [P1] Page title, search, upload button
│   │   ├── knowledge/
│   │   │   ├── UploadModal.tsx          # [P1] Tab: paste text | upload file | paste URL
│   │   │   ├── KnowledgeCard.tsx        # [P1] Title, tags, source, date
│   │   │   ├── KnowledgeList.tsx        # [P1] Grid of KnowledgeCards
│   │   │   └── TagFilter.tsx            # [P1] Filter pills by tag
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx           # [P2] Message list + input bar
│   │   │   ├── ChatMessage.tsx          # [P2] User bubble + AI bubble
│   │   │   └── CitationChip.tsx         # [P2] Clickable source chip under AI answer
│   │   ├── graph/
│   │   │   ├── GraphCanvas.tsx          # [P2] react-force-graph — nodes + edges
│   │   │   └── NodeTooltip.tsx          # [P2] Hover card — title, tags, connections
│   │   └── playbooks/
│   │       ├── PlaybookCard.tsx         # [P3] Topic, step count, generated date
│   │       └── PlaybookStep.tsx         # [P3] Checkbox + step text + source badge
│   │
│   ├── lib/
│   │   ├── api.ts                       # [P1] Base fetch wrapper (attaches cookies automatically)
│   │   └── utils.ts                     # [P1] cn(), formatDate(), truncate()
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                   # [P1] getCurrentUser, logout
│   │   ├── useKnowledge.ts              # [P1] list, upload, delete knowledge items
│   │   ├── useChat.ts                   # [P2] send message, stream response
│   │   ├── useGraph.ts                  # [P2] fetch nodes + edges
│   │   └── usePlaybooks.ts              # [P3] list, generate, get playbook
│   │
│   ├── types/
│   │   └── index.ts                     # [P1] All TS types — User, Org, KnowledgeItem, etc.
│   │
│   ├── middleware.ts                    # [P1] Route protection — redirect if no auth cookie
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── .env.local
│   └── package.json
│
│
└── server/                              # ── BACKEND (FastAPI)
    ├── app/
    │   ├── main.py                      # [P1] FastAPI app init, CORS, include routers
    │   ├── config.py                    # [P1] Pydantic settings — reads from .env
    │   │
    │   ├── routers/
    │   │   ├── auth.py                  # [P1] POST /auth/register, /auth/login, /auth/logout, /auth/me
    │   │   ├── knowledge.py             # [P1] POST /knowledge, GET /knowledge, GET /knowledge/:id, DELETE /knowledge/:id
    │   │   ├── chat.py                  # [P2] POST /chat
    │   │   ├── graph.py                 # [P2] GET /graph
    │   │   └── playbooks.py             # [P3] POST /playbooks/generate, GET /playbooks, GET /playbooks/:id, PATCH /playbooks/:id/steps/:sid
    │   │
    │   ├── services/
    │   │   ├── auth_service.py          # [P1] hash_password, verify_password, create_jwt, decode_jwt, set_cookie, clear_cookie
    │   │   ├── ingestion.py             # [P1] parse → chunk → embed → pinecone upsert → prisma save → auto-tag
    │   │   ├── embeddings.py            # [P1] OpenRouter embed call (or OpenAI-compat embed)
    │   │   ├── vector_store.py          # [P1] Pinecone upsert, query, delete
    │   │   ├── rag.py                   # [P2] semantic search → build prompt → OpenRouter LLM → return answer + citations
    │   │   ├── linker.py                # [P2] cosine similarity → create Neo4j edges (RELATED_TO)
    │   │   ├── graph_store.py           # [P2] Neo4j driver — upsert node, create edge, get all nodes+edges for org
    │   │   └── playbook_gen.py          # [P3] RAG retrieval → OpenRouter LLM → parse SOP steps → save
    │   │
    │   ├── middleware/
    │   │   └── auth_middleware.py       # [P1] FastAPI dependency — decode JWT from cookie, inject current_user
    │   │
    │   ├── schemas/
    │   │   ├── auth.py                  # [P1] RegisterRequest, LoginRequest, UserOut
    │   │   ├── knowledge.py             # [P1] UploadRequest, KnowledgeOut
    │   │   ├── chat.py                  # [P2] ChatRequest, ChatResponse, CitationOut
    │   │   └── playbook.py              # [P3] PlaybookOut, StepOut, GenerateRequest
    │   │
    │   └── db/
    │       ├── prisma.py                # [P1] Prisma client singleton (prisma-client-py)
    │       └── neo4j.py                 # [P2] Neo4j async driver singleton
    │
    ├── prisma/
    │   ├── schema.prisma                # [P1] Full DB schema — see below
    │   └── migrations/                  # [P1] Auto-generated by `prisma migrate dev`
    │
    ├── requirements.txt                 # [P1] All Python deps — see below
    ├── .env
    └── Dockerfile
```

---

## Prisma Schema (server/prisma/schema.prisma)

```prisma
generator client {
  provider             = "prisma-client-py"
  interface            = "asyncio"
  recursive_type_depth = 5
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Org {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       User[]
  knowledge   KnowledgeItem[]
  playbooks   Playbook[]
}

model User {
  id           String   @id @default(cuid())
  orgId        String
  email        String   @unique
  name         String
  passwordHash String
  role         Role     @default(MEMBER)
  createdAt    DateTime @default(now())

  org          Org      @relation(fields: [orgId], references: [id])
}

enum Role {
  ADMIN
  MEMBER
}

model KnowledgeItem {
  id          String        @id @default(cuid())
  orgId       String
  title       String
  content     String        @db.Text
  source      SourceType    @default(PASTE)
  tags        String[]
  pineconeId  String?       @unique  // vector chunk ID in Pinecone
  createdBy   String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  org         Org           @relation(fields: [orgId], references: [id])
  steps       PlaybookStep[]
}

enum SourceType {
  PASTE
  UPLOAD
  URL
  SLACK
  NOTION
}

model Playbook {
  id        String         @id @default(cuid())
  orgId     String
  topic     String
  title     String
  createdAt DateTime       @default(now())

  org       Org            @relation(fields: [orgId], references: [id])
  steps     PlaybookStep[]
}

model PlaybookStep {
  id              String        @id @default(cuid())
  playbookId      String
  order           Int
  text            String        @db.Text
  completed       Boolean       @default(false)
  sourceItemId    String?

  playbook        Playbook      @relation(fields: [playbookId], references: [id])
  sourceItem      KnowledgeItem? @relation(fields: [sourceItemId], references: [id])
}
```

---

## Auth Flow (Custom JWT, HTTP-only Cookies)

```
REGISTER:
  POST /auth/register { name, email, password, orgName }
  → hash password (bcrypt)
  → create Org + User in Postgres via Prisma
  → sign JWT { userId, orgId, role } with SECRET_KEY (expires 7d)
  → set HTTP-only cookie: access_token=<jwt>; HttpOnly; Secure; SameSite=Lax
  → return UserOut

LOGIN:
  POST /auth/login { email, password }
  → find user by email
  → verify bcrypt hash
  → sign JWT
  → set HTTP-only cookie
  → return UserOut

LOGOUT:
  POST /auth/logout
  → clear cookie (set empty, maxAge=0)

AUTH MIDDLEWARE (every protected route):
  → read access_token from request.cookies
  → decode JWT → get userId, orgId, role
  → inject as current_user dependency
  → if invalid/expired → 401

FRONTEND:
  → Next.js middleware.ts checks for access_token cookie
  → if missing → redirect to /login
  → all API calls use credentials: 'include' so cookie is sent automatically
```

---

## OpenRouter Integration

OpenRouter is fully OpenAI-SDK compatible. Just change the base URL.

```python
# server/app/services/embeddings.py
import httpx

OPENROUTER_API_KEY = settings.OPENROUTER_API_KEY
OPENROUTER_BASE = "https://openrouter.ai/api/v1"

async def get_embedding(text: str) -> list[float]:
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{OPENROUTER_BASE}/embeddings",
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            json={
                "model": "openai/text-embedding-3-small",  # or any embed model
                "input": text
            }
        )
        return res.json()["data"][0]["embedding"]
```

```python
# server/app/services/rag.py
import httpx

async def call_llm(prompt: str, system: str) -> str:
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{OPENROUTER_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://brainyfy.app",  # required by OpenRouter
                "X-Title": "Brainyfy"
            },
            json={
                "model": "anthropic/claude-3.5-sonnet",  # swap any model here
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=60.0
        )
        return res.json()["choices"][0]["message"]["content"]
```

**Swap models anytime** by changing the `model` string:
- `anthropic/claude-3.5-sonnet` — best quality
- `openai/gpt-4o` — fast + capable
- `mistralai/mixtral-8x7b-instruct` — cheap + fast
- `google/gemini-flash-1.5` — ultra cheap for tagging/classification

---

## Ingestion Pipeline (Phase 1 core logic)

```
POST /knowledge/upload
  body: { content?: string, url?: string, file?: binary }

ingestion.py:
  1. parse()     → extract raw text from file (PDF→text) / URL (httpx scrape) / paste
  2. chunk()     → split into 512-token chunks, 50-token overlap (manual split, no LangChain needed)
  3. embed()     → call embeddings.py → get vector per chunk
  4. store()     → pinecone.upsert(id=f"{item_id}_{chunk_n}", vector=..., metadata={orgId, itemId, chunkIndex})
  5. save()      → prisma.knowledgeitem.create(...)
  6. auto_tag()  → call LLM: "Given this text, return 3-5 short topic tags as JSON array" → save tags
  7. auto_title()→ call LLM: "Generate a short title for this content (max 8 words)" → save title
```

---

## RAG Pipeline (Phase 2 core logic)

```
POST /chat
  body: { question: string }
  auth: current_user (orgId from JWT cookie)

rag.py:
  1. embed question → vector
  2. pinecone.query(vector, top_k=5, filter={"orgId": org_id})
  3. fetch matching KnowledgeItems from Prisma by pineconeId
  4. build prompt:
       system = "You are Brainyfy, the company brain for {org_name}.
                 Answer only from the provided knowledge. If you don't know, say so.
                 Always cite the source item title at the end of each claim."
       user   = f"Context:\n{chunks_text}\n\nQuestion: {question}"
  5. call_llm(prompt, system) → answer string
  6. extract citations → which item IDs were used
  7. return { answer, citations: [{ id, title, excerpt }] }
```

---

## Auto-Linker (Phase 2 core logic)

```
linker.py — runs after every new upload:

  1. fetch embedding of new item from Pinecone
  2. query Pinecone: top_k=10, filter={"orgId": org_id}
  3. for each result where score > 0.75:
       neo4j.create_edge(new_item_id, result_item_id, score)
  4. also upsert new_item as Neo4j node: { id, title, tags }
```

---

## Environment Variables

### client/.env.local
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### server/.env
```bash
# Database
DATABASE_URL=postgresql://brainyfy:password@localhost:5432/brainyfy

# Auth
JWT_SECRET_KEY=your-super-secret-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=7

# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# Pinecone
PINECONE_API_KEY=
PINECONE_INDEX_NAME=brainyfy

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# App
FRONTEND_URL=http://localhost:3000
```

---

## Python Requirements (server/requirements.txt)

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
prisma==0.13.1              # prisma-client-py
httpx==0.27.0               # OpenRouter + URL scraping
bcrypt==4.1.3               # password hashing
python-jose[cryptography]==3.3.0  # JWT
python-multipart==0.0.9     # file uploads
pinecone-client==3.2.2      # Pinecone vector DB
neo4j==5.19.0               # Neo4j async driver
pypdf2==3.0.1               # PDF text extraction
python-dotenv==1.0.1
pydantic-settings==2.2.1
```

---

## Frontend Types (client/types/index.ts)

```typescript
export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  orgId: string
}

export interface Org {
  id: string
  name: string
  slug: string
}

export interface KnowledgeItem {
  id: string
  orgId: string
  title: string
  content: string
  source: 'PASTE' | 'UPLOAD' | 'URL' | 'SLACK' | 'NOTION'
  tags: string[]
  createdBy: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

export interface Citation {
  id: string
  title: string
  excerpt: string
}

export interface GraphNode {
  id: string
  label: string
  tags: string[]
  val?: number  // node size weight
}

export interface GraphEdge {
  source: string
  target: string
  similarity: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphEdge[]
}

export interface Playbook {
  id: string
  topic: string
  title: string
  createdAt: string
  steps: PlaybookStep[]
}

export interface PlaybookStep {
  id: string
  order: number
  text: string
  completed: boolean
  sourceItemId?: string
  sourceItem?: { title: string }
}
```

---

## API Endpoint Reference

### Phase 1 — Auth + Knowledge

```
POST   /auth/register           { name, email, password, orgName } → UserOut + set cookie
POST   /auth/login              { email, password } → UserOut + set cookie
POST   /auth/logout             → clear cookie
GET    /auth/me                 → UserOut (from cookie)

POST   /knowledge               { content?, url?, file? } → KnowledgeOut  (multipart)
GET    /knowledge               → KnowledgeOut[]   (filtered by orgId from JWT)
GET    /knowledge/:id           → KnowledgeOut
DELETE /knowledge/:id           → { success: true }
```

### Phase 2 — Chat + Graph

```
POST   /chat                    { question: string } → { answer, citations[] }
GET    /graph                   → { nodes: GraphNode[], links: GraphEdge[] }
```

### Phase 3 — Playbooks

```
POST   /playbooks/generate      { topic: string } → PlaybookOut
GET    /playbooks               → PlaybookOut[]
GET    /playbooks/:id           → PlaybookOut
PATCH  /playbooks/:id/steps/:sid { completed: boolean } → StepOut
```

---

## Init Commands

```bash
# ── CLIENT
cd client
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false
npm install react-force-graph

# ── SERVER
cd server
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Init Prisma
prisma init                       # creates prisma/schema.prisma
# paste schema above into schema.prisma
prisma migrate dev --name init    # creates tables + generates client
prisma generate                   # generate prisma-client-py

# ── LOCAL DBs (Docker)
docker run -d --name brainyfy-pg \
  -e POSTGRES_DB=brainyfy \
  -e POSTGRES_USER=brainyfy \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 postgres:15

docker run -d --name brainyfy-neo4j \
  -e NEO4J_AUTH=neo4j/password \
  -p 7474:7474 -p 7687:7687 neo4j:5

# ── RUN
# Terminal 1 — backend
cd server && uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd client && npm run dev
```

---

## Phase Summary

| Phase | What gets built | End state |
|---|---|---|
| **Phase 1** | Auth (register/login/logout) · Upload knowledge · List items · Auto-tag + title via LLM | User can sign up, upload docs/text, see tagged knowledge list |
| **Phase 2** | Chat (RAG) · Auto-linker · Graph view | User asks questions, gets cited answers. Graph shows auto-connections. |
| **Phase 3** | Playbook generation · Playbook steps · Settings page | Click topic → get runnable SOP from company knowledge |

---

*Brainyfy v2 scaffold — client-server, OpenRouter, Prisma, custom JWT · Ready to build*