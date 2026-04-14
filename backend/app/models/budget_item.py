from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    proposal_id: Mapped[int] = mapped_column(ForeignKey("proposals.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    cost_per_unit: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    total_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    proposal = relationship("Proposal", back_populates="budget_items")
