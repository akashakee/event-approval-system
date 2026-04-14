from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    proposals = relationship(
        "Proposal",
        back_populates="student",
        foreign_keys="Proposal.student_id",
    )
    review_decisions = relationship(
        "ReviewDecision",
        back_populates="reviewer",
        foreign_keys="ReviewDecision.reviewer_id",
    )
