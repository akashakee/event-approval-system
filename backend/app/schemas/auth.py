from typing import Literal

from pydantic import BaseModel, EmailStr

RoleType = Literal["student", "faculty"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: RoleType


class UserResponse(BaseModel):
    email: EmailStr
    role: RoleType


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
