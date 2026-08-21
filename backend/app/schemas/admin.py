"""
Admin dashboard schemas — response models matching frontend chart data formats.
All chart data endpoints return data in the exact JSON format from appConfig.json.
"""

from typing import Optional, List
from pydantic import BaseModel, Field


# ─── Dashboard Overview ───

class AdminDashboardResponse(BaseModel):
    """Main admin dashboard overview data."""
    total_users: int
    total_transactions: int
    total_flagged: int
    total_blocked: int
    pending_reviews: int
    risk_distribution: dict  # Matches frontend PieChart format
    score_trend: list        # Matches frontend LineChart format
    recent_alerts: list


# ─── Risk Distribution Donut Chart ───

class RiskSlice(BaseModel):
    """Single slice in the risk distribution donut chart."""
    name: str
    value: int
    count: str
    percent: str
    sliceColor: str
    dotColor: str


class RiskDistribution(BaseModel):
    """Risk distribution chart data matching frontend PieChart format."""
    totalValue: str
    totalLabel: str = "Total accounts"
    slices: List[RiskSlice]


# ─── Score Trend Line Chart ───

class ScoreTrendPoint(BaseModel):
    """Single point in the 7-day risk score trend line chart."""
    day: str
    score: float


# ─── Account Trend Area Chart ───

class AccountTrendPoint(BaseModel):
    """Single point in the account-specific risk score area chart."""
    month: str
    score: float


# ─── Weekly Volume Bar Chart ───

class WeeklyVolumePoint(BaseModel):
    """Single point in the weekly transaction throughput dual bar chart."""
    day: str
    cleared: int
    review: int


# ─── Risk Reasons Horizontal Bar Chart ───

class RiskReasonBar(BaseModel):
    """Single bar in the horizontal risk reasons chart."""
    name: str
    value: int


# ─── Account List ───

class AccountSummary(BaseModel):
    """Summary of a single user account for admin list view."""
    id: str
    full_name: str
    email: str
    upi_id: Optional[str] = None
    balance: float
    total_transactions: int
    avg_risk_score: float
    risk_level: str
    last_active: Optional[str] = None


class AccountListResponse(BaseModel):
    """Paginated list of accounts for admin homepage."""
    accounts: List[AccountSummary]
    total: int
    page: int
    page_size: int


# ─── Specific Account Panel ───

class AccountDetailResponse(BaseModel):
    """Full account detail for the Specific Account Panel."""
    account: AccountSummary
    account_trend: List[AccountTrendPoint]  # Area chart data
    transaction_chart: list  # Bar graph: dated txn values
    risk_score_overlay: list  # Line graph: risk score over time
    avg_risk_score_as_payee: float
    recent_transactions: list
    total_transactions: int


# ─── Alert Management ───

class AlertResponse(BaseModel):
    """Single alert for admin review."""
    id: str
    transaction_id: str
    user_id: str
    user_name: str
    user_email: str
    alert_type: str
    risk_score: float
    risk_explanation: str
    risk_factors: list
    status: str
    created_at: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None


class ReviewAlertRequest(BaseModel):
    """Schema for admin reviewing an alert."""
    action: str = Field(..., pattern="^(approve|reject|false_positive)$")
    review_notes: Optional[str] = Field(None, max_length=500)


class AlertListResponse(BaseModel):
    """Paginated list of alerts."""
    alerts: List[AlertResponse]
    total: int
    page: int
    page_size: int
