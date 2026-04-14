from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.proposal import (
    ProposalCreateRequest,
    ProposalResponse,
    ProposalUpdateRequest,
)
from app.services.auth import require_active_role
from app.services.proposal import (
    create_proposal,
    get_my_proposal,
    list_my_proposals,
    update_rejected_proposal,
)

router = APIRouter()


@router.post("", response_model=ProposalResponse)
def create(
    payload: ProposalCreateRequest,
    current_user: User = Depends(require_active_role("student")),
    db: Session = Depends(get_db),
) -> ProposalResponse:
    return create_proposal(payload, current_user, db)


@router.get("/mine", response_model=list[ProposalResponse])
def list_mine(
    current_user: User = Depends(require_active_role("student")),
    db: Session = Depends(get_db),
) -> list[ProposalResponse]:
    return list_my_proposals(current_user, db)


@router.get("/{proposal_id}", response_model=ProposalResponse)
def get_one(
    proposal_id: int = Path(gt=0),
    current_user: User = Depends(require_active_role("student")),
    db: Session = Depends(get_db),
) -> ProposalResponse:
    return get_my_proposal(proposal_id, current_user, db)


@router.put("/{proposal_id}", response_model=ProposalResponse)
def update(
    payload: ProposalUpdateRequest,
    proposal_id: int = Path(gt=0),
    current_user: User = Depends(require_active_role("student")),
    db: Session = Depends(get_db),
) -> ProposalResponse:
    return update_rejected_proposal(proposal_id, payload, current_user, db)
