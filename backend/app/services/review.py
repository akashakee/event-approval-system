from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.proposal import Proposal
from app.models.review_decision import ReviewDecision
from app.models.user import User
from app.schemas.proposal import ProposalResponse, ReviewDecisionRequest


def _proposal_query():
    return (
        select(Proposal)
        .options(selectinload(Proposal.budget_items))
        .options(selectinload(Proposal.student))
        .options(selectinload(Proposal.review_decisions))
    )


def _serialize_proposal(proposal: Proposal) -> ProposalResponse:
    return ProposalResponse.model_validate(proposal)


def _require_faculty(user: User) -> None:
    if user.role != "faculty":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faculty access required.",
        )


def _get_reviewable_proposal(db: Session, proposal_id: int) -> Proposal:
    proposal = db.scalar(_proposal_query().where(Proposal.id == proposal_id))
    if proposal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found.",
        )
    return proposal


def list_pending_reviews(current_user: User, db: Session) -> list[ProposalResponse]:
    _require_faculty(current_user)

    proposals = db.scalars(
        _proposal_query()
        .where(Proposal.status == "under_review")
        .order_by(Proposal.created_at.asc())
    ).all()
    return [_serialize_proposal(proposal) for proposal in proposals]


def record_review_decision(
    proposal_id: int,
    payload: ReviewDecisionRequest,
    decision: str,
    current_user: User,
    db: Session,
) -> ProposalResponse:
    _require_faculty(current_user)
    proposal = _get_reviewable_proposal(db, proposal_id)

    if proposal.status != "under_review":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only proposals under review can be decided.",
        )

    proposal.status = decision
    proposal.remarks = payload.remarks.strip()
    proposal.review_decisions.append(
        ReviewDecision(
            reviewer_id=current_user.id,
            decision=decision,
            remarks=proposal.remarks,
        )
    )

    db.commit()
    refreshed_proposal = _get_reviewable_proposal(db, proposal_id)
    return _serialize_proposal(refreshed_proposal)
