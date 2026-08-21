"""
Auth schemas — request/response models for authentication endpoints.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{9,14}$")
    upi_id: Optional[str] = Field(None, pattern=r"^[\w.-]+@[\w]+$")


class LoginRequest(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str


class RefreshTokenRequest(BaseModel):
    """Schema for token refresh."""
    refresh_token: str


class UserResponse(BaseModel):
    """Schema for current user info (/auth/me)."""
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    upi_id: Optional[str] = None
    is_active: bool
    balance: float
    created_at: str
