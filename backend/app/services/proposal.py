from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.budget_item import BudgetItem
from app.models.proposal import Proposal
from app.models.user import User
from app.schemas.proposal import (
    BudgetItemPayload,
    ProposalCreateRequest,
    ProposalResponse,
    ProposalUpdateRequest,
)


def _calculate_total_cost(item: BudgetItemPayload) -> Decimal:
    return item.quantity * item.cost_per_unit


def _calculate_estimated_budget(items: list[BudgetItemPayload]) -> Decimal:
    return sum((_calculate_total_cost(item) for item in items), start=Decimal("0"))


def _serialize_proposal(proposal: Proposal) -> ProposalResponse:
    return ProposalResponse.model_validate(proposal)


def _proposal_query():
    return (
        select(Proposal)
        .options(selectinload(Proposal.budget_items))
        .options(selectinload(Proposal.student))
        .options(selectinload(Proposal.review_decisions))
    )


def _get_proposal_for_student(db: Session, proposal_id: int, student_id: int) -> Proposal | None:
    return db.scalar(
        _proposal_query().where(
            Proposal.id == proposal_id,
            Proposal.student_id == student_id,
        )
    )


def create_proposal(
    payload: ProposalCreateRequest,
    current_user: User,
    db: Session,
) -> ProposalResponse:
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required.",
        )

    estimated_budget = _calculate_estimated_budget(payload.budget_items)
    proposal = Proposal(
        student_id=current_user.id,
        title=payload.title,
        description=payload.description,
        event_date=payload.event_date,
        venue=payload.venue,
        estimated_budget=estimated_budget,
        status="under_review",
    )
    proposal.budget_items = [
        BudgetItem(
            name=item.name,
            quantity=item.quantity,
            cost_per_unit=item.cost_per_unit,
            total_cost=_calculate_total_cost(item),
        )
        for item in payload.budget_items
    ]

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    proposal = _get_proposal_for_student(db, proposal.id, current_user.id)
    return _serialize_proposal(proposal)


def list_my_proposals(current_user: User, db: Session) -> list[ProposalResponse]:
    proposals = db.scalars(
        _proposal_query()
        .where(Proposal.student_id == current_user.id)
        .order_by(Proposal.created_at.desc())
    ).all()
    return [_serialize_proposal(proposal) for proposal in proposals]


def get_my_proposal(proposal_id: int, current_user: User, db: Session) -> ProposalResponse:
    proposal = _get_proposal_for_student(db, proposal_id, current_user.id)
    if proposal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found.",
        )

    return _serialize_proposal(proposal)


def update_rejected_proposal(
    proposal_id: int,
    payload: ProposalUpdateRequest,
    current_user: User,
    db: Session,
) -> ProposalResponse:
    proposal = _get_proposal_for_student(db, proposal_id, current_user.id)
    if proposal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found.",
        )

    if proposal.status != "rejected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only rejected proposals can be updated.",
        )

    proposal.title = payload.title
    proposal.description = payload.description
    proposal.event_date = payload.event_date
    proposal.venue = payload.venue
    proposal.estimated_budget = _calculate_estimated_budget(payload.budget_items)
    proposal.status = "under_review"
    proposal.remarks = None
    proposal.budget_items.clear()
    proposal.budget_items.extend(
        [
            BudgetItem(
                name=item.name,
                quantity=item.quantity,
                cost_per_unit=item.cost_per_unit,
                total_cost=_calculate_total_cost(item),
            )
            for item in payload.budget_items
        ]
    )

    db.commit()
    db.refresh(proposal)

    proposal = _get_proposal_for_student(db, proposal.id, current_user.id)
    return _serialize_proposal(proposal)
