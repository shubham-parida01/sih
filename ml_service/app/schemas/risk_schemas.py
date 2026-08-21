"""
Risk request/response schemas for the ML microservice.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class TransactionData(BaseModel):
    """Input transaction data for risk scoring."""
    transaction_id: str
    user_id: str
    payee_upi: str
    payee_name: str
    amount: float
    device_fingerprint: Optional[str] = None
    ip_address: Optional[str] = None
    location: Optional[dict] = None
    user_registered_device: Optional[str] = None


class UserHistory(BaseModel):
    """User's behavioral context for risk scoring."""
    avg_amount: float = 0
    max_amount: float = 0
    total_transactions: int = 0
    total_volume: float = 0
    recent_transactions: List[dict] = []
    known_payees: List[str] = []
    known_devices: List[str] = []
    recent_txn_count_5min: int = 0
    account_age_days: int = 0
    registered_device: Optional[str] = None


class RiskScoreRequest(BaseModel):
    """Full request to the risk scoring endpoint."""
    transaction: TransactionData
    user_history: UserHistory


class RiskFactor(BaseModel):
    """Individual risk factor with contribution score and explanation."""
    factor: str
    contribution: float
    detail: str


class RiskScoreResponse(BaseModel):
    """Response from the risk scoring endpoint."""
    risk_score: float
    risk_level: str
    explanation: str
    factors: List[RiskFactor]
    recommendation: str


class DeviceCheckRequest(BaseModel):
    """Request for device fingerprint check."""
    user_id: str
    current_fingerprint: str


class DeviceCheckResponse(BaseModel):
    """Response from device check."""
    device_changed: bool
    risk_contribution: float


class ExplainRequest(BaseModel):
    """Request for detailed explainability."""
    transaction_id: str
    risk_data: dict


class BehaviorCheckRequest(BaseModel):
    """Request for behavior pattern analysis."""
    user_id: str
    transaction: TransactionData
    user_history: UserHistory
