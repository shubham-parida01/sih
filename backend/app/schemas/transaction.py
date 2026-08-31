"""
Transaction schemas — request/response models for payment and transaction endpoints.
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class InitiateTransactionRequest(BaseModel):
    """Schema for initiating a payment (Pay Someone page)."""
    payee_upi: str = Field(..., pattern=r"^[\w.-]+@[\w]+$")
    payee_name: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0, le=100000)  # Max 1 lakh per UPI txn
    device_fingerprint: Optional[str] = None
    location: Optional[dict] = None  # { lat: float, lon: float }
    note: Optional[str] = Field(None, max_length=255)
    telemetry: Optional[dict] = None  # On-device hardware & situational telemetry


class TransactionResponse(BaseModel):
    """Schema for a single transaction response."""
    id: str
    payee_upi: str
    payee_name: str
    amount: float
    currency: str = "INR"
    status: str
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    risk_explanation: Optional[str] = None
    risk_factors: List[dict] = []
    device_changed: bool = False
    model_type: Optional[str] = "unknown"
    created_at: str
    completed_at: Optional[str] = None


class TransactionListResponse(BaseModel):
    """Schema for paginated transaction list."""
    transactions: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class ConfirmTransactionRequest(BaseModel):
    """Schema for user confirming a paused/warned transaction."""
    user_acknowledged_risk: bool = Field(
        ...,
        description="User must explicitly acknowledge the risk warning"
    )


class RiskWarningResponse(BaseModel):
    """
    Response returned when a transaction is paused due to risk.
    Contains the explainable warning for the user.
    """
    transaction_id: str
    status: str
    risk_score: float
    risk_level: str
    explanation: str
    factors: List[dict]
    recommendation: str
    can_proceed: bool  # False for critical risk (admin must review)
