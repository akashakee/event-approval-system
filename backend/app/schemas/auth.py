from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

RoleType = Literal["student", "faculty"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: RoleType

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        cleaned_value = value.strip()
        if len(cleaned_value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return cleaned_value


class UserResponse(BaseModel):
    email: EmailStr
    role: RoleType


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
