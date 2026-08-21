"""
User profile schemas — request/response models for user portal endpoints.
"""

from typing import Optional
from pydantic import BaseModel, Field


class ProfileUpdateRequest(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{9,14}$")
    upi_id: Optional[str] = Field(None, pattern=r"^[\w.-]+@[\w]+$")
    address: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfileResponse(BaseModel):
    """Schema for user profile response."""
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    upi_id: Optional[str] = None
    balance: float
    is_active: bool
    profile: dict
    created_at: str
    updated_at: str


class DashboardResponse(BaseModel):
    """Schema for user personal home page (Paytm-style dashboard)."""
    full_name: str
    balance: float
    upi_id: Optional[str] = None
    recent_transactions: list
    total_transactions: int
    risk_summary: dict  # { low: count, medium: count, high: count }


class DeviceFingerprintRequest(BaseModel):
    """Schema for registering/updating device fingerprint."""
    fingerprint_hash: str
    device_name: Optional[str] = None
    device_os: Optional[str] = None
    app_version: Optional[str] = None
