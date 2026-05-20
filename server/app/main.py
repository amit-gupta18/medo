from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.neo4j import close_neo4j


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup — Alembic handles migrations; nothing to connect here.
    yield
    # Shutdown — dispose engine + close Neo4j
    from app.db.session import engine

    await engine.dispose()
    await close_neo4j()


app = FastAPI(title="Brainyfy API", version="2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "https://medo-inky.vercel.app",
        "https://medo-inky.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import auth, chat, graph, knowledge, playbooks, integrations  # noqa: E402

app.include_router(auth.router)
app.include_router(knowledge.router)
app.include_router(chat.router)
app.include_router(graph.router)
app.include_router(playbooks.router)
app.include_router(integrations.router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to the Brainyfy API",
        "docs_url": "/docs",
        "health_url": "/health",
        "version": "2.0"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}
