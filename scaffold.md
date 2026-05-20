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
| Relational DB | PostgreSQL + SQLAlchemy + Alembic | Users, orgs, knowledge items, playbooks. SQLAlchemy 2.0 async ORM + Alembic for migrations |
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
    │   ├── main.py                      # [P1] FastAPI app init, CORS, include routers, lifespan (DB init)
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
    │   │   ├── ingestion.py             # [P1] parse → chunk → embed → pinecone upsert → SQLAlchemy save → auto-tag
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
    │   ├── models/                      # [P1] SQLAlchemy ORM models (replaces Prisma schema)
    │   │   ├── __init__.py              # [P1] Re-export all models + Base
    │   │   ├── base.py                  # [P1] DeclarativeBase, common mixins (id, timestamps)
    │   │   ├── org.py                   # [P1] Org model
    │   │   ├── user.py                  # [P1] User model
    │   │   ├── knowledge_item.py        # [P1] KnowledgeItem model
    │   │   ├── playbook.py              # [P3] Playbook model
    │   │   └── playbook_step.py         # [P3] PlaybookStep model
    │   │
    │   └── db/
    │       ├── session.py               # [P1] AsyncEngine + async_sessionmaker singleton
    │       └── neo4j.py                 # [P2] Neo4j async driver singleton
    │
    ├── alembic/                         # [P1] Alembic migrations (replaces prisma/migrations)
    │   ├── env.py                       # [P1] Alembic env — imports Base.metadata, uses async engine
    │   ├── script.py.mako               # [P1] Migration template
    │   └── versions/                    # [P1] Auto-generated migration scripts
    │
    ├── alembic.ini                      # [P1] Alembic config — points sqlalchemy.url to DATABASE_URL
    ├── requirements.txt                 # [P1] All Python deps — see below
    ├── .env
    └── Dockerfile
```

---

## SQLAlchemy Models (server/app/models/)

### base.py — DeclarativeBase + common mixins

```python
# server/app/models/base.py
import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def generate_cuid() -> str:
    """Simple cuid-like unique ID. For production consider the `cuid2` package."""
    return uuid.uuid4().hex


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class IDMixin:
    id: Mapped[str] = mapped_column(
        String(32), primary_key=True, default=generate_cuid
    )
```

### org.py

```python
# server/app/models/org.py
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, IDMixin, TimestampMixin


class Org(IDMixin, TimestampMixin, Base):
    __tablename__ = "orgs"

    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # relationships
    users = relationship("User", back_populates="org", lazy="selectin")
    knowledge_items = relationship("KnowledgeItem", back_populates="org", lazy="selectin")
    playbooks = relationship("Playbook", back_populates="org", lazy="selectin")
```

### user.py

```python
# server/app/models/user.py
import enum

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, IDMixin


class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


class User(IDMixin, Base):
    __tablename__ = "users"

    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id"), index=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.MEMBER)
    created_at: Mapped = mapped_column(server_default=__import__("sqlalchemy").func.now())

    # relationships
    org = relationship("Org", back_populates="users", lazy="selectin")
```

### knowledge_item.py

```python
# server/app/models/knowledge_item.py
import enum

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, IDMixin, TimestampMixin


class SourceType(str, enum.Enum):
    PASTE = "PASTE"
    UPLOAD = "UPLOAD"
    URL = "URL"
    SLACK = "SLACK"
    NOTION = "NOTION"


class KnowledgeItem(IDMixin, TimestampMixin, Base):
    __tablename__ = "knowledge_items"

    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id"), index=True)
    title: Mapped[str] = mapped_column(String(512))
    content: Mapped[str] = mapped_column(Text)
    source: Mapped[SourceType] = mapped_column(Enum(SourceType), default=SourceType.PASTE)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    pinecone_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    created_by: Mapped[str] = mapped_column(String(32))  # user ID who created it

    # relationships
    org = relationship("Org", back_populates="knowledge_items", lazy="selectin")
    steps = relationship("PlaybookStep", back_populates="source_item", lazy="selectin")
```

### playbook.py

```python
# server/app/models/playbook.py
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, IDMixin


class Playbook(IDMixin, Base):
    __tablename__ = "playbooks"

    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id"), index=True)
    topic: Mapped[str] = mapped_column(String(512))
    title: Mapped[str] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # relationships
    org = relationship("Org", back_populates="playbooks", lazy="selectin")
    steps = relationship(
        "PlaybookStep", back_populates="playbook", lazy="selectin",
        order_by="PlaybookStep.order"
    )
```

### playbook_step.py

```python
# server/app/models/playbook_step.py
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, IDMixin


class PlaybookStep(IDMixin, Base):
    __tablename__ = "playbook_steps"

    playbook_id: Mapped[str] = mapped_column(ForeignKey("playbooks.id"), index=True)
    order: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    source_item_id: Mapped[str | None] = mapped_column(
        ForeignKey("knowledge_items.id"), nullable=True
    )

    # relationships
    playbook = relationship("Playbook", back_populates="steps")
    source_item = relationship("KnowledgeItem", back_populates="steps", lazy="selectin")
```

### \_\_init\_\_.py — Re-export everything

```python
# server/app/models/__init__.py
from .base import Base
from .org import Org
from .user import User, Role
from .knowledge_item import KnowledgeItem, SourceType
from .playbook import Playbook
from .playbook_step import PlaybookStep

__all__ = [
    "Base",
    "Org", "User", "Role",
    "KnowledgeItem", "SourceType",
    "Playbook", "PlaybookStep",
]
```

---

## Database Session (server/app/db/session.py)

```python
# server/app/db/session.py
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

# Use asyncpg driver for async PostgreSQL
# Convert postgres:// → postgresql+asyncpg:// if needed
DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
).replace(
    "postgres://", "postgresql+asyncpg://"
)

engine = create_async_engine(DATABASE_URL, echo=False, pool_size=5, max_overflow=10)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncSession:
    """FastAPI dependency — yields an async DB session per request."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

---

## Alembic Setup (server/alembic/)

### alembic.ini (top-level)

```ini
# server/alembic.ini
[alembic]
script_location = alembic
# sqlalchemy.url is overridden in env.py from settings.DATABASE_URL
sqlalchemy.url = driver://user:pass@localhost/dbname

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### alembic/env.py

```python
# server/alembic/env.py
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

# Import Base so Alembic sees all table metadata
from app.models import Base  # noqa: F401
from app.config import settings

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Build async URL from settings
DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
).replace(
    "postgres://", "postgresql+asyncpg://"
)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode — emit SQL to script output."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with async engine."""
    connectable = create_async_engine(DATABASE_URL)

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

---

## FastAPI Lifespan (DB init in main.py)

```python
# server/app/main.py
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, knowledge, chat, graph, playbooks


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup — nothing needed; Alembic handles migrations separately.
    # If you want to auto-create tables in dev (skip Alembic), uncomment:
    # from app.db.session import engine
    # from app.models import Base
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown — dispose engine
    from app.db.session import engine
    await engine.dispose()


app = FastAPI(title="Brainyfy API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(graph.router, prefix="/graph", tags=["graph"])
app.include_router(playbooks.router, prefix="/playbooks", tags=["playbooks"])
```

---

## Auth Flow (Custom JWT, HTTP-only Cookies)

```
REGISTER:
  POST /auth/register { name, email, password, orgName }
  → hash password (bcrypt)
  → create Org + User in Postgres via SQLAlchemy session
  → sign JWT { userId, orgId, role } with SECRET_KEY (expires 7d)
  → set HTTP-only cookie: access_token=<jwt>; HttpOnly; Secure; SameSite=Lax
  → return UserOut

LOGIN:
  POST /auth/login { email, password }
  → find user by email via SQLAlchemy query
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

## Example: Auth Router with SQLAlchemy

```python
# server/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import Org, User, Role
from app.models.base import generate_cuid
from app.schemas.auth import RegisterRequest, LoginRequest, UserOut
from app.services.auth_service import (
    hash_password, verify_password, create_jwt, set_auth_cookie, clear_auth_cookie,
)

router = APIRouter()


@router.post("/register", response_model=UserOut)
async def register(body: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")

    # Create org
    slug = body.org_name.lower().replace(" ", "-")
    org = Org(id=generate_cuid(), name=body.org_name, slug=slug)
    db.add(org)

    # Create user
    user = User(
        id=generate_cuid(),
        org_id=org.id,
        email=body.email,
        name=body.name,
        password_hash=hash_password(body.password),
        role=Role.ADMIN,
    )
    db.add(user)
    await db.flush()  # flush so IDs are available before commit

    # Set JWT cookie
    token = create_jwt(user_id=user.id, org_id=org.id, role=user.role.value)
    set_auth_cookie(response, token)

    return UserOut(id=user.id, name=user.name, email=user.email, role=user.role.value, orgId=org.id)


@router.post("/login", response_model=UserOut)
async def login(body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    token = create_jwt(user_id=user.id, org_id=user.org_id, role=user.role.value)
    set_auth_cookie(response, token)

    return UserOut(id=user.id, name=user.name, email=user.email, role=user.role.value, orgId=user.org_id)
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
  5. save()      → db.add(KnowledgeItem(...)); await db.flush()
  6. auto_tag()  → call LLM: "Given this text, return 3-5 short topic tags as JSON array" → update item.tags
  7. auto_title()→ call LLM: "Generate a short title for this content (max 8 words)" → update item.title
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
  3. fetch matching KnowledgeItems via SQLAlchemy:
       result = await db.execute(
           select(KnowledgeItem).where(KnowledgeItem.pinecone_id.in_(pinecone_ids))
       )
       items = result.scalars().all()
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
# PostgreSQL (Neon — neon.tech — no credit card)
# Use pooled URL for app queries, direct URL only for alembic migrate
DATABASE_URL=postgresql://user:password@ep-xxx-yyy.us-east-1.aws.neon.tech/brainyfy?sslmode=require

# Auth
JWT_SECRET_KEY=your-super-secret-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=7

# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# Pinecone (app.pinecone.io — free tier, no credit card)
PINECONE_API_KEY=pcsk_xxxxxxxxxxxx
PINECONE_INDEX_NAME=brainyfy
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1

# Neo4j (AuraDB Free — console.neo4j.io)
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-aura-generated-password

# App
FRONTEND_URL=http://localhost:3000
```

---

## Python Requirements (server/requirements.txt)

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy[asyncio]==2.0.30     # SQLAlchemy 2.0 with async support
asyncpg==0.29.0                 # Async PostgreSQL driver for SQLAlchemy
alembic==1.13.1                 # Database migrations
greenlet==3.0.3                 # Required by SQLAlchemy async
httpx==0.27.0                   # OpenRouter + URL scraping
bcrypt==4.1.3                   # password hashing
python-jose[cryptography]==3.3.0  # JWT
python-multipart==0.0.9         # file uploads
pinecone==3.2.2                 # Pinecone vector DB (package name is pinecone, not pinecone-client)
neo4j==5.19.0                   # Neo4j async driver
pypdf==4.2.0                    # PDF text extraction (pypdf2 is deprecated)
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

# Init Alembic (one-time setup)
alembic init alembic              # creates alembic/ dir + alembic.ini
# Then edit alembic/env.py to import app.models.Base and use async engine (see above)

# Generate initial migration from SQLAlchemy models
alembic revision --autogenerate -m "init"

# Apply migration (creates all tables in PostgreSQL)
alembic upgrade head

# ── PINECONE INDEX (run once)
# In a Python shell or a one-off script:
# from pinecone import Pinecone, ServerlessSpec
# pc = Pinecone(api_key="your-key")
# pc.create_index(name="brainyfy", dimension=1536, metric="cosine",
#   spec=ServerlessSpec(cloud="aws", region="us-east-1"))

# No local DB setup needed — Neon, Pinecone, and Neo4j AuraDB are all cloud/serverless

# ── RUN
# Terminal 1 — backend
cd server && uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd client && npm run dev
```

### Common Alembic Commands

```bash
# After changing SQLAlchemy models, generate a new migration:
alembic revision --autogenerate -m "describe your change"

# Apply all pending migrations:
alembic upgrade head

# Rollback one migration:
alembic downgrade -1

# See current migration state:
alembic current

# See migration history:
alembic history
```

---

## Phase Summary

| Phase | What gets built | End state |
|---|---|---|
| **Phase 1** | Auth (register/login/logout) · Upload knowledge · List items · Auto-tag + title via LLM | User can sign up, upload docs/text, see tagged knowledge list |
| **Phase 2** | Chat (RAG) · Auto-linker · Graph view | User asks questions, gets cited answers. Graph shows auto-connections. |
| **Phase 3** | Playbook generation · Playbook steps · Settings page | Click topic → get runnable SOP from company knowledge |

---

*Brainyfy v2 scaffold — client-server, OpenRouter, SQLAlchemy + Alembic, custom JWT · Ready to build*