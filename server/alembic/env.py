import asyncio
import ssl as _ssl
import sys
from pathlib import Path
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# Ensure the server directory is on sys.path so 'app' is importable
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

# Import all models so Alembic sees every table
from app.models import Base  # noqa: F401
from app.config import settings

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# asyncpg doesn't understand libpq params like sslmode, channel_binding, etc.
_STRIP_PARAMS = {"sslmode", "channel_binding"}


def _make_async_url(raw: str) -> tuple[str, dict]:
    """Convert a standard postgres URL to an asyncpg-compatible one."""
    url = raw.replace("postgresql://", "postgresql+asyncpg://", 1)
    url = url.replace("postgres://", "postgresql+asyncpg://", 1)

    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    needs_ssl = params.get("sslmode", [None])[0] in ("require", "verify-ca", "verify-full")

    clean_params = {k: v[0] for k, v in params.items() if k not in _STRIP_PARAMS}
    clean_query = urlencode(clean_params)
    clean_url = urlunparse(parsed._replace(query=clean_query))

    connect_args = {}
    if needs_ssl:
        connect_args["ssl"] = _ssl.create_default_context()

    return clean_url, connect_args


DATABASE_URL, _connect_args = _make_async_url(settings.DATABASE_URL)


def run_migrations_offline() -> None:
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
    connectable = create_async_engine(DATABASE_URL, connect_args=_connect_args)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
