from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User


def seed_users(db: Session) -> None:
    default_users = [
        {
            "email": "student@university.edu",
            "role": "student",
            "password": "Student@123",
        },
        {
            "email": "faculty@university.edu",
            "role": "faculty",
            "password": "Faculty@123",
        },
    ]

    for user_data in default_users:
        existing_user = db.scalar(
            select(User).where(User.email == user_data["email"])
        )
        if existing_user:
            continue

        db.add(
            User(
                email=user_data["email"],
                role=user_data["role"],
                password_hash=get_password_hash(user_data["password"]),
            )
        )

    db.commit()
