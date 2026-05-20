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
        "PlaybookStep",
        back_populates="playbook",
        lazy="selectin",
        order_by="PlaybookStep.order",
        cascade="all, delete-orphan",
    )
