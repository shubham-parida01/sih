"""
User model — MongoDB document structure and Pydantic schemas.
Supports both 'user' and 'admin' roles.
"""

from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId


class UserRole(str, Enum):
    """User role enum — determines which portal/dashboard they access."""
    USER = "user"
    ADMIN = "admin"


class UserProfile(BaseModel):
    """Embedded profile subdocument."""
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    pan_number: Optional[str] = None  # Masked/encrypted at rest


class UserDocument(BaseModel):
    """
    Full user document as stored in MongoDB.
    Used internally — never returned directly to clients.
    """
    email: str
    phone: Optional[str] = None
    full_name: str
    hashed_password: str
    role: UserRole = UserRole.USER
    upi_id: Optional[str] = None
    is_active: bool = True
    device_fingerprint: Optional[str] = None
    profile: UserProfile = UserProfile()
    # Simulated bank balance for hackathon demo
    balance: float = Field(default=50000.0, description="Simulated bank balance in INR")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        json_encoders = {ObjectId: str}


def create_user_document(
    email: str,
    full_name: str,
    hashed_password: str,
    role: UserRole = UserRole.USER,
    phone: Optional[str] = None,
    upi_id: Optional[str] = None,
) -> dict:
    """
    Create a user document dict ready for MongoDB insertion.
    """
    now = datetime.now(timezone.utc)
    return {
        "email": email,
        "phone": phone,
        "full_name": full_name,
        "hashed_password": hashed_password,
        "role": role.value,
        "upi_id": upi_id,
        "is_active": True,
        "device_fingerprint": None,
        "profile": {
            "avatar_url": None,
            "address": None,
            "pan_number": None,
        },
        "balance": 50000.0,  # Starting balance for demo
        "created_at": now,
        "updated_at": now,
    }
