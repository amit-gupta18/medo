# Brainyfy

Company brain — client-server app with Next.js frontend and FastAPI backend.

## Structure

```
medo/
├── client/   # Next.js (App Router) + Tailwind
└── server/   # FastAPI + Prisma + Pinecone + Neo4j
```

## Quick start

### 1. Server

```bash
cd server
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with DATABASE_URL, JWT_SECRET_KEY, and optional API keys

prisma generate
prisma migrate dev --name init

uvicorn app.main:app --reload --port 8000
```

Without `OPENROUTER_API_KEY`, `PINECONE_API_KEY`, or Neo4j, the server still runs using in-memory vector fallback and dev stubs for LLM/embeddings.

### 2. Client

```bash
cd client
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). API requests proxy to the backend via `/api/*` → `http://localhost:8000`.

## Phases

| Phase | Features |
|-------|----------|
| P1 | Auth, knowledge upload/list, auto-tag/title |
| P2 | RAG chat, knowledge graph |
| P3 | Playbook generation, settings |

See `scaffold.md` for full architecture and API reference.
