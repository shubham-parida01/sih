"""
Transaction model — MongoDB document structure.
Tracks the full lifecycle of a payment from initiation through risk scoring to completion.
"""

from datetime import datetime, timezone
from typing import Optional, List
from enum import Enum

from pydantic import BaseModel, Field


class TransactionStatus(str, Enum):
    """Transaction lifecycle states matching the workflow diagram."""
    INITIATED = "initiated"
    RISK_CHECK = "risk_check"
    COMPLETED = "completed"
    PAUSED = "paused"           # Medium risk — waiting for user review
    WARNING_SHOWN = "warning_shown"
    CONFIRMED = "confirmed"      # User confirmed despite warning
    CANCELLED = "cancelled"      # User cancelled after warning
    BLOCKED = "blocked"          # High risk — auto-blocked
    ADMIN_REVIEW = "admin_review"
    REJECTED = "rejected"        # Admin rejected
    FAILED = "failed"            # Transaction failed


class RiskLevel(str, Enum):
    """Risk classification levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskFactor(BaseModel):
    """Individual risk factor with contribution score."""
    factor: str
    contribution: float
    detail: str


class Location(BaseModel):
    """Geographic location for transaction."""
    lat: Optional[float] = None
    lon: Optional[float] = None


def create_transaction_document(
    user_id: str,
    payee_upi: str,
    payee_name: str,
    amount: float,
    device_fingerprint: Optional[str] = None,
    ip_address: Optional[str] = None,
    location: Optional[dict] = None,
) -> dict:
    """
    Create a transaction document dict ready for MongoDB insertion.
    """
    now = datetime.now(timezone.utc)
    return {
        "user_id": user_id,
        "payee_upi": payee_upi,
        "payee_name": payee_name,
        "amount": amount,
        "currency": "INR",
        "status": TransactionStatus.INITIATED.value,
        "risk_score": None,
        "risk_level": None,
        "risk_explanation": None,
        "risk_factors": [],
        "device_fingerprint": device_fingerprint,
        "device_changed": False,
        "ip_address": ip_address,
        "location": location or {"lat": None, "lon": None},
        "created_at": now,
        "updated_at": now,
        "completed_at": None,
    }
