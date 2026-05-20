import ssl as _ssl
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

# asyncpg doesn't understand libpq params like sslmode, channel_binding, etc.
# Strip them from the URL and pass SSL via connect_args instead.
_STRIP_PARAMS = {"sslmode", "channel_binding"}


def _make_async_url(raw: str) -> tuple[str, dict]:
    """Convert a standard postgres URL to an asyncpg-compatible one."""
    url = raw.replace("postgresql://", "postgresql+asyncpg://", 1)
    url = url.replace("postgres://", "postgresql+asyncpg://", 1)

    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    # Check if SSL was requested
    needs_ssl = params.get("sslmode", [None])[0] in ("require", "verify-ca", "verify-full")

    # Remove params asyncpg can't handle
    clean_params = {k: v[0] for k, v in params.items() if k not in _STRIP_PARAMS}
    clean_query = urlencode(clean_params)
    clean_url = urlunparse(parsed._replace(query=clean_query))

    connect_args = {}
    if needs_ssl:
        connect_args["ssl"] = _ssl.create_default_context()

    return clean_url, connect_args


DATABASE_URL, _connect_args = _make_async_url(settings.DATABASE_URL)

engine = create_async_engine(
    DATABASE_URL, echo=False, pool_size=5, max_overflow=10,
    connect_args=_connect_args,
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """FastAPI dependency — yields an async DB session per request."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
