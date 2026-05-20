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
