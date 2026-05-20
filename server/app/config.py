from pydantic import model_validator
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
    NEO4J_USERNAME: str = ""
    NEO4J_PASSWORD: str = "password"

    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8100"

    # Slack OAuth
    SLACK_CLIENT_ID: str = ""
    SLACK_CLIENT_SECRET: str = ""
    SLACK_SIGNING_SECRET: str = ""

    # Notion OAuth
    NOTION_CLIENT_ID: str = ""
    NOTION_CLIENT_SECRET: str = ""

    @model_validator(mode="after")
    def _neo4j_user_compat(self):
        """Accept either NEO4J_USER or NEO4J_USERNAME from .env."""
        if self.NEO4J_USERNAME and self.NEO4J_USER == "neo4j":
            self.NEO4J_USER = self.NEO4J_USERNAME
        return self


settings = Settings()
