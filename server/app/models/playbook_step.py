from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, IDMixin


class PlaybookStep(IDMixin, Base):
    __tablename__ = "playbook_steps"

    playbook_id: Mapped[str] = mapped_column(ForeignKey("playbooks.id", ondelete="CASCADE"), index=True)
    order: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    source_item_id: Mapped[str | None] = mapped_column(
        ForeignKey("knowledge_items.id"), nullable=True
    )

    # relationships
    playbook = relationship("Playbook", back_populates="steps")
    source_item = relationship("KnowledgeItem", back_populates="steps", lazy="selectin")
