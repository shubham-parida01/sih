"""
Alert model — tracks high-risk transaction alerts for admin review.
"""

from datetime import datetime, timezone
from typing import Optional
from enum import Enum


class AlertType(str, Enum):
    """Types of risk alerts."""
    HIGH_RISK = "high_risk"
    DEVICE_CHANGE = "device_change"
    UNUSUAL_PATTERN = "unusual_pattern"
    VOICE_PHISHING = "voice_phishing"
    RAPID_SUCCESSION = "rapid_succession"


class AlertStatus(str, Enum):
    """Alert review status."""
    PENDING = "pending"
    REVIEWED = "reviewed"
    FALSE_POSITIVE = "false_positive"
    CONFIRMED_FRAUD = "confirmed_fraud"


def create_alert_document(
    transaction_id: str,
    user_id: str,
    alert_type: str,
    risk_score: float,
    risk_explanation: str,
    risk_factors: list = None,
) -> dict:
    """Create an alert document for admin review."""
    now = datetime.now(timezone.utc)
    return {
        "transaction_id": transaction_id,
        "user_id": user_id,
        "alert_type": alert_type,
        "risk_score": risk_score,
        "risk_explanation": risk_explanation,
        "risk_factors": risk_factors or [],
        "status": AlertStatus.PENDING.value,
        "reviewed_by": None,
        "reviewed_at": None,
        "review_notes": None,
        "created_at": now,
    }


def create_webhook_log_document(
    alert_id: str,
    payload: dict,
    status: str = "pending",
) -> dict:
    """Create a webhook delivery log entry."""
    now = datetime.now(timezone.utc)
    return {
        "alert_id": alert_id,
        "payload": payload,
        "status": status,  # pending, delivered, failed
        "attempts": 0,
        "last_attempt_at": None,
        "response_code": None,
        "error_message": None,
        "created_at": now,
    }
