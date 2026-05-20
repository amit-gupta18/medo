import enum

from sqlalchemy import Enum, ForeignKey, String, Text, UniqueConstraint
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
    __table_args__ = (
        UniqueConstraint("integration_id", "external_id", name="uq_ki_integration_external"),
    )

    org_id: Mapped[str] = mapped_column(ForeignKey("orgs.id"), index=True)
    title: Mapped[str] = mapped_column(String(512))
    content: Mapped[str] = mapped_column(Text)
    source: Mapped[SourceType] = mapped_column(
        Enum(SourceType), default=SourceType.PASTE
    )
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    pinecone_id: Mapped[str | None] = mapped_column(
        String(255), unique=True, nullable=True
    )
    created_by: Mapped[str] = mapped_column(String(32))
    integration_id: Mapped[str | None] = mapped_column(
        ForeignKey("integrations.id", ondelete="SET NULL"), nullable=True, index=True
    )
    external_id: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # relationships
    org = relationship("Org", back_populates="knowledge_items", lazy="selectin")
    integration = relationship("Integration", back_populates="knowledge_items", lazy="selectin")
    steps = relationship("PlaybookStep", back_populates="source_item", lazy="selectin")
