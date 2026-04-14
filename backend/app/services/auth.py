from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, decode_access_token, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse

http_bearer = HTTPBearer(auto_error=False)


def _serialize_user(user: User) -> UserResponse:
    return UserResponse(email=user.email, role=user.role)


def _get_user_by_email_and_role(db: Session, email: str, role: str) -> User | None:
    return db.scalar(
        select(User).where(User.email == email.lower(), User.role == role)
    )


def _get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


def login_user(payload: LoginRequest, db: Session) -> TokenResponse:
    user = _get_user_by_email_and_role(db, str(payload.email), payload.role)
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email, password, or role.",
    )

    if user is None:
        raise invalid_credentials

    if not verify_password(payload.password, user.password_hash):
        raise invalid_credentials

    user_response = _serialize_user(user)
    access_token = create_access_token(subject=user.email, role=user.role)
    return TokenResponse(access_token=access_token, user=user_response)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
    db: Session = Depends(get_db),
) -> UserResponse:
    user = get_current_active_user(credentials, db)
    return _serialize_user(user)


def get_current_active_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    user = _get_user_by_email(db, payload["sub"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user no longer exists.",
        )

    if user.role != payload["role"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated role is no longer valid.",
        )

    return user


def require_role(expected_role: str):
    def role_dependency(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        if current_user.role != expected_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"{expected_role.title()} access required.",
            )
        return current_user

    return role_dependency
