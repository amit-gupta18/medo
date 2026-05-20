from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql://brainyfy:password@localhost:5432/brainyfy"

    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_DAYS: int = 7

    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE: str = "https://openrouter.ai/api/v1"

    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "brainyfy"

    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"

    FRONTEND_URL: str = "http://localhost:3000"


settings = Settings()
