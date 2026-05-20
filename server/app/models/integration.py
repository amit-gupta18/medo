import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, IDMixin, TimestampMixin


class IntegrationType(str, enum.Enum):
    SLACK = "SLACK"
    NOTION = "NOTION"
    LINEAR = "LINEAR"


class SyncStatus(str, enum.Enum):
    IDLE = "IDLE"
    SYNCING = "SYNCING"
    ERROR = "ERROR"


class Integration(IDMixin, TimestampMixin, Base):
    __tablename__ = "integrations"
    __table_args__ = (
        UniqueConstraint("org_id", "type", name="uq_integrations_org_type"),
    )

    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id"), index=True)
    type: Mapped[IntegrationType] = mapped_column(Enum(IntegrationType))
    access_token: Mapped[str] = mapped_column(Text)
    refresh_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    team_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    team_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    scopes: Mapped[str | None] = mapped_column(Text, nullable=True)
    bot_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    sync_status: Mapped[SyncStatus] = mapped_column(
        Enum(SyncStatus), default=SyncStatus.IDLE
    )
    last_synced_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    config: Mapped[dict | None] = mapped_column(JSONB, nullable=True, default=dict)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # relationships
    org = relationship("Org", back_populates="integrations", lazy="selectin")
    knowledge_items = relationship(
        "KnowledgeItem", back_populates="integration", lazy="selectin"
    )
