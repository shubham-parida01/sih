"""
Admin router — handles admin dashboard, account management, alerts, and chart data endpoints.
All endpoints require admin authentication.
"""

import hmac
import hashlib
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, Request, HTTPException, status
from typing import Optional

from bson import ObjectId

from app.schemas.admin import AdminCreateUserRequest, ReviewAlertRequest
from app.services.admin_service import (
    get_admin_dashboard,
    get_all_accounts,
    get_account_detail,
    get_weekly_volume,
    get_risk_reasons,
    get_alerts,
    review_alert,
    get_flagged_transactions,
)
from app.services.websocket_manager import ws_manager
from app.middleware.auth_middleware import require_admin
from app.config import settings
from app.database import get_database
from app.models.alert import create_webhook_log_document
from app.utils.security import decode_token

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])


# ─── Dashboard ───

@router.get("/dashboard")
async def dashboard(admin: dict = Depends(require_admin)):
    """
    Get the main admin dashboard overview.
    Returns risk distribution (PieChart), score trend (LineChart), and recent alerts.
    """
    data = await get_admin_dashboard()
    return {"success": True, "data": data}


# ─── Accounts ───

@router.post("/accounts", response_model=dict, status_code=201)
async def create_user_account(
    request: AdminCreateUserRequest,
    admin: dict = Depends(require_admin)
):
    """
    Admin creates a new user account directly in the backend.
    """
    from app.services.auth_service import register_user
    user = await register_user(
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        phone=request.phone,
        upi_id=request.upi_id,
        initial_balance=request.initial_balance,
    )
    return {
        "success": True,
        "message": "User account created successfully by administrator",
        "data": {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
        }
    }


@router.get("/accounts")
async def list_accounts(
    admin: dict = Depends(require_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
):
    """
    List all user accounts (admin homepage — accounts by branch).
    Each account entry is a clickable linked text leading to the account's detail panel.
    """
    data = await get_all_accounts(page=page, page_size=page_size, search=search)
    return {"success": True, "data": data}


@router.get("/accounts/{user_id}")
async def account_detail(
    user_id: str,
    admin: dict = Depends(require_admin),
):
    """
    Get the Specific Account Panel data.
    Includes: bar graph (dated txn values), line graph (risk score overlay),
    avg risk score (as payee), and account details.
    """
    data = await get_account_detail(user_id)
    return {"success": True, "data": data}


@router.put("/accounts/{user_id}/status")
async def toggle_account_status(
    user_id: str,
    admin: dict = Depends(require_admin)
):
    """
    Toggle a user account's active status (Place hold / Release hold).
    """
    from bson.objectid import ObjectId
    db = get_database()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")
        
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
        
    new_status = not user.get("is_active", True)
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {
        "success": True,
        "message": f"Account status updated to {'Active' if new_status else 'On Hold'}",
        "is_active": new_status
    }


@router.get("/accounts/{user_id}/transactions")
async def account_transactions(
    user_id: str,
    admin: dict = Depends(require_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Get all transactions for a specific user account."""
    from app.services.transaction_service import get_transaction_history
    data = await get_transaction_history(
        user_id=user_id,
        page=page,
        page_size=page_size,
    )
    return {"success": True, "data": data}


# ─── Chart Data Endpoints ───

@router.get("/charts/weekly-volume")
async def weekly_volume(admin: dict = Depends(require_admin)):
    """
    Weekly transaction throughput dual bar chart data.
    Format: [{ day, cleared, review }]
    """
    data = await get_weekly_volume()
    return {"success": True, "data": {"weeklyVolume": data}}


@router.get("/charts/risk-reasons")
async def risk_reasons(admin: dict = Depends(require_admin)):
    """
    Horizontal risk reasons bar chart data.
    Format: [{ name, value }]
    """
    data = await get_risk_reasons()
    return {"success": True, "data": {"riskReasons": data}}


# ─── Alerts ───

@router.get("/alerts")
async def list_alerts(
    admin: dict = Depends(require_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
):
    """Get all risk alerts (paginated, filterable by status)."""
    data = await get_alerts(page=page, page_size=page_size, status_filter=status)
    return {"success": True, "data": data}


@router.post("/alerts/{alert_id}/review")
async def review_alert_endpoint(
    alert_id: str,
    request_body: ReviewAlertRequest,
    admin: dict = Depends(require_admin),
):
    """
    Admin reviews a flagged alert.
    Actions: approve (complete txn), reject (fail txn), false_positive (mark FP).
    """
    result = await review_alert(
        alert_id=alert_id,
        admin_id=admin["_id"],
        action=request_body.action,
        review_notes=request_body.review_notes,
    )
    return {"success": True, "data": result}


# ─── Flagged Transactions ───

@router.get("/transactions/flagged")
async def flagged_transactions(
    admin: dict = Depends(require_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Get all paused/flagged/blocked transactions."""
    data = await get_flagged_transactions(page=page, page_size=page_size)
    return {"success": True, "data": data}


# ─── False Positives ───

@router.get("/false-positives")
async def list_false_positives(
    admin: dict = Depends(require_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Get transactions marked as false positives."""
    data = await get_alerts(page=page, page_size=page_size, status_filter="false_positive")
    return {"success": True, "data": data}


# ─── Webhook Endpoint ───

@router.post("/webhooks/risk-alert")
async def webhook_risk_alert(request: Request):
    """
    Webhook endpoint for receiving risk alerts from the Risk Alert Service.
    POST /api/admin/webhooks/risk-alert
    Verifies webhook signature, logs delivery, and pushes to WebSocket.
    """
    body = await request.body()
    signature = request.headers.get("X-Webhook-Signature", "")

    # Verify signature
    expected_sig = hmac.new(
        settings.WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_sig):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature")

    payload = await request.json()
    db = get_database()

    # Log the webhook delivery
    log_doc = create_webhook_log_document(
        alert_id=payload.get("alert_id", ""),
        payload=payload,
        status="delivered",
    )
    log_doc["attempts"] = 1
    log_doc["last_attempt_at"] = datetime.now(timezone.utc)
    log_doc["response_code"] = 200
    await db.webhook_logs.insert_one(log_doc)

    # Push to WebSocket (SSE / WebSocket trigger pop-up)
    await ws_manager.broadcast_alert(payload)

    return {"success": True, "message": "Webhook received and processed"}


# ─── WebSocket Endpoint ───

@router.websocket("/ws/{admin_id}")
async def websocket_endpoint(websocket: WebSocket, admin_id: str):
    """
    WebSocket endpoint for real-time admin notifications.
    Admin frontend connects here to receive push alerts for high-risk transactions.

    Connection URL: ws://localhost:8000/api/admin/ws/{admin_id}?token=<access_token>
    """
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing access token")
        return

    payload = decode_token(token)
    if (
        payload is None
        or payload.get("type") != "access"
        or payload.get("role") != "admin"
        or payload.get("sub") != admin_id
    ):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Unauthorized admin websocket")
        return

    db = get_database()
    try:
        admin = await db.users.find_one({"_id": ObjectId(admin_id), "role": "admin", "is_active": True})
    except Exception:
        admin = None
    if not admin:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Admin account not found")
        return

    await ws_manager.connect_admin(websocket, admin_id)

    try:
        while True:
            # Keep connection alive, listen for any messages from admin
            data = await websocket.receive_text()
            # Admin can send acknowledgments or pings
            if data == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        await ws_manager.disconnect_admin(websocket, admin_id)
