from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.services.auth import get_current_user, login_user, require_role

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return login_user(payload, db)


@router.get("/me", response_model=UserResponse)
def me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return current_user


@router.get("/student", response_model=UserResponse)
def student_only(
    current_user: UserResponse = Depends(require_role("student")),
) -> UserResponse:
    return current_user


@router.get("/faculty", response_model=UserResponse)
def faculty_only(
    current_user: UserResponse = Depends(require_role("faculty")),
) -> UserResponse:
    return current_user
