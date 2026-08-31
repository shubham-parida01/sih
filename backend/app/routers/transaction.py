"""
Transaction router — handles payment initiation, confirmation, cancellation, and history.
Core payment flow endpoints that integrate with the risk scoring pipeline.
"""

from fastapi import APIRouter, Depends, Request, Query
from typing import Optional

from app.schemas.transaction import InitiateTransactionRequest, ConfirmTransactionRequest
from app.services.transaction_service import (
    initiate_transaction,
    confirm_transaction,
    cancel_transaction,
    get_transaction_history,
    get_transaction_detail,
)
from app.middleware.auth_middleware import require_user, get_client_ip

router = APIRouter(prefix="/api/transaction", tags=["Transactions"])


@router.post("/initiate")
async def initiate_payment(
    request_body: InitiateTransactionRequest,
    request: Request,
    user: dict = Depends(require_user),
):
    """
    Initiate a new payment (Pay Someone page).

    This endpoint:
    1. Creates a transaction record
    2. Sends it to the ML risk scoring service
    3. Returns the result:
       - If LOW risk → transaction auto-completed
       - If MEDIUM/HIGH risk → transaction paused with warning
       - If CRITICAL risk → transaction blocked, admin notified via WebSocket
    """
    ip_address = get_client_ip(request)

    result = await initiate_transaction(
        user_id=user["_id"],
        payee_upi=request_body.payee_upi,
        payee_name=request_body.payee_name,
        amount=request_body.amount,
        device_fingerprint=request_body.device_fingerprint,
        ip_address=ip_address,
        location=request_body.location,
        telemetry=request_body.telemetry,
    )

    return {"success": True, "data": result}


@router.post("/confirm/{txn_id}")
async def confirm_payment(
    txn_id: str,
    request_body: ConfirmTransactionRequest,
    user: dict = Depends(require_user),
):
    """
    Confirm a paused transaction after the user has seen the risk warning.
    The user must explicitly acknowledge the risk.
    """
    if not request_body.user_acknowledged_risk:
        return {
            "success": False,
            "message": "You must acknowledge the risk warning before proceeding",
        }

    result = await confirm_transaction(user_id=user["_id"], txn_id=txn_id)
    return {"success": True, "data": result}


@router.post("/cancel/{txn_id}")
async def cancel_payment(
    txn_id: str,
    user: dict = Depends(require_user),
):
    """Cancel a paused transaction."""
    result = await cancel_transaction(user_id=user["_id"], txn_id=txn_id)
    return {"success": True, "data": result}


@router.get("/history")
async def transaction_history(
    user: dict = Depends(require_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
):
    """
    Get paginated transaction history.
    Data isolation: only returns transactions belonging to the authenticated user.
    """
    result = await get_transaction_history(
        user_id=user["_id"],
        page=page,
        page_size=page_size,
        status_filter=status,
    )
    return {"success": True, "data": result}


@router.get("/{txn_id}")
async def transaction_detail(
    txn_id: str,
    user: dict = Depends(require_user),
):
    """
    Get a single transaction's full details including risk explanation.
    Data isolation: only the transaction owner can view it.
    """
    result = await get_transaction_detail(user_id=user["_id"], txn_id=txn_id)
    return {"success": True, "data": result}
