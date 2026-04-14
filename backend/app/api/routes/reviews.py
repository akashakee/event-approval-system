from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.proposal import ProposalResponse, ReviewDecisionRequest
from app.services.auth import require_active_role
from app.services.review import list_pending_reviews, record_review_decision

router = APIRouter()


@router.get("/pending", response_model=list[ProposalResponse])
def pending_reviews(
    current_user: User = Depends(require_active_role("faculty")),
    db: Session = Depends(get_db),
) -> list[ProposalResponse]:
    return list_pending_reviews(current_user, db)


@router.post("/{proposal_id}/approve", response_model=ProposalResponse)
def approve_review(
    payload: ReviewDecisionRequest,
    proposal_id: int = Path(gt=0),
    current_user: User = Depends(require_active_role("faculty")),
    db: Session = Depends(get_db),
) -> ProposalResponse:
    return record_review_decision(proposal_id, payload, "approved", current_user, db)


@router.post("/{proposal_id}/reject", response_model=ProposalResponse)
def reject_review(
    payload: ReviewDecisionRequest,
    proposal_id: int = Path(gt=0),
    current_user: User = Depends(require_active_role("faculty")),
    db: Session = Depends(get_db),
) -> ProposalResponse:
    return record_review_decision(proposal_id, payload, "rejected", current_user, db)
