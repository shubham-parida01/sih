"""
Transaction service — handles the full payment lifecycle including risk scoring.
Core of the fraud detection system.
"""

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from app.database import get_database
from app.models.transaction import (
    TransactionStatus,
    RiskLevel,
    create_transaction_document,
)
from app.models.alert import create_alert_document, AlertType
from app.services.risk_client import score_transaction, check_device
from app.services.websocket_manager import ws_manager
from app.utils.exceptions import (
    NotFoundException,
    BadRequestException,
    ForbiddenException,
)


# Risk thresholds (matching workflow diagram)
RISK_THRESHOLD_LOW = 30      # score < 30 → auto-approve
RISK_THRESHOLD_MEDIUM = 60   # 30 ≤ score < 60 → pause for user review
RISK_THRESHOLD_HIGH = 80     # 60 ≤ score < 80 → pause + warn strongly
# score ≥ 80 → CRITICAL → block + admin review


MAX_SINGLE_TXN_LIMIT = 100000.0  # ₹1,00,000 per txn
MAX_DAILY_TXN_LIMIT = 100000.0   # ₹1,00,000 per 24h


async def initiate_transaction(
    user_id: str,
    payee_upi: str,
    payee_name: str,
    amount: float,
    device_fingerprint: Optional[str] = None,
    ip_address: Optional[str] = None,
    location: Optional[dict] = None,
    telemetry: Optional[dict] = None,
) -> dict:
    """
    Initiate a payment transaction and run it through risk scoring.
    """
    db = get_database()

    # 1. Enforce per-transaction limit (₹1,00,000 max)
    if amount > MAX_SINGLE_TXN_LIMIT:
        raise BadRequestException("Single transaction limit exceeded. Maximum allowed per transfer is ₹1,00,000 as per UPI guidelines.")

    # 2. Validate user exists and has sufficient balance
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise NotFoundException("User")

    current_balance = user.get("balance", 0.0)
    if current_balance < amount:
        raise BadRequestException(f"Insufficient balance. Your current account balance is ₹{current_balance:,.2f}")

    # 3. Check cumulative daily spending in last 24 hours
    now = datetime.now(timezone.utc)
    from datetime import timedelta
    one_day_ago = now - timedelta(days=1)
    pipeline = [
        {"$match": {
            "user_id": user_id,
            "status": {"$in": [TransactionStatus.COMPLETED.value, TransactionStatus.PAUSED.value]},
            "created_at": {"$gte": one_day_ago}
        }},
        {"$group": {"_id": None, "total_spent": {"$sum": "$amount"}}}
    ]
    spent_today = 0.0
    async for doc in db.transactions.aggregate(pipeline):
        spent_today = doc.get("total_spent", 0.0)

    if spent_today + amount > MAX_DAILY_TXN_LIMIT:
        remaining = max(0.0, MAX_DAILY_TXN_LIMIT - spent_today)
        raise BadRequestException(f"Daily UPI transfer limit of ₹1,00,000 reached. Remaining limit for today: ₹{remaining:,.2f}")

    # Step 1: Create transaction record
    txn_doc = create_transaction_document(
        user_id=user_id,
        payee_upi=payee_upi,
        payee_name=payee_name,
        amount=amount,
        device_fingerprint=device_fingerprint,
        ip_address=ip_address,
        location=location,
    )
    result = await db.transactions.insert_one(txn_doc)
    txn_id = str(result.inserted_id)

    # Step 2: Update status to risk_check
    await db.transactions.update_one(
        {"_id": result.inserted_id},
        {"$set": {"status": TransactionStatus.RISK_CHECK.value, "updated_at": datetime.now(timezone.utc)}}
    )

    # Step 3: Build context for ML service
    user_history = await _build_user_history(user_id, user)

    transaction_data = {
        "transaction_id": txn_id,
        "user_id": user_id,
        "payee_upi": payee_upi,
        "payee_name": payee_name,
        "amount": amount,
        "device_fingerprint": device_fingerprint,
        "ip_address": ip_address,
        "location": location,
        "user_registered_device": user.get("device_fingerprint"),
        "telemetry": telemetry or {},
    }

    # Step 4: Score transaction via ML microservice
    risk_result = await score_transaction(transaction_data, user_history)

    risk_score = risk_result.get("risk_score", 50.0)
    risk_level = risk_result.get("risk_level", "medium")
    risk_explanation = risk_result.get("explanation", "")
    risk_factors = risk_result.get("factors", [])
    recommendation = risk_result.get("recommendation", "")

    # Check device change
    device_changed = False
    if device_fingerprint and user.get("device_fingerprint"):
        if device_fingerprint != user["device_fingerprint"]:
            device_changed = True

    # Step 5: Determine status based on risk threshold
    now = datetime.now(timezone.utc)

    if risk_score < RISK_THRESHOLD_LOW:
        # SAFE → Auto-approve
        new_status = TransactionStatus.COMPLETED.value
        # Deduct balance
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"balance": -amount}, "$set": {"updated_at": now}}
        )
        completed_at = now

    else:
        # Flagged (Medium or High risk)
        if risk_score < RISK_THRESHOLD_HIGH:
            new_status = TransactionStatus.PAUSED.value
            alert_type = "suspicious_pattern"
        else:
            new_status = TransactionStatus.BLOCKED.value
            alert_type = AlertType.HIGH_RISK.value

        completed_at = None

        # Create alert for admin
        alert_doc = create_alert_document(
            transaction_id=txn_id,
            user_id=user_id,
            alert_type=alert_type,
            risk_score=risk_score,
            risk_explanation=risk_explanation,
            risk_factors=risk_factors,
        )
        alert_result = await db.alerts.insert_one(alert_doc)

        # Push WebSocket notification to admin
        await ws_manager.broadcast_alert({
            "alert_id": str(alert_result.inserted_id),
            "transaction_id": txn_id,
            "user_id": user_id,
            "user_name": user.get("full_name", "Unknown"),
            "user_email": user.get("email", ""),
            "amount": amount,
            "payee_upi": payee_upi,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_explanation": risk_explanation,
            "timestamp": now.isoformat(),
        })

    model_type = risk_result.get("model_type", "unknown")

    # Update transaction with risk data
    await db.transactions.update_one(
        {"_id": result.inserted_id},
        {"$set": {
            "status": new_status,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_explanation": risk_explanation,
            "risk_factors": risk_factors,
            "device_changed": device_changed,
            "model_type": model_type,
            "updated_at": now,
            "completed_at": completed_at,
        }}
    )

    # Store risk score in separate collection for analytics
    await db.risk_scores.insert_one({
        "transaction_id": txn_id,
        "user_id": user_id,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "model_type": model_type,
        "created_at": now,
    })

    # Build response
    response = {
        "id": txn_id,
        "payee_upi": payee_upi,
        "payee_name": payee_name,
        "amount": amount,
        "currency": "INR",
        "status": new_status,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_explanation": risk_explanation,
        "risk_factors": risk_factors,
        "factors": risk_factors,
        "recommendation": recommendation,
        "device_changed": device_changed,
        "model_type": model_type,
        "created_at": txn_doc["created_at"].isoformat(),
        "completed_at": completed_at.isoformat() if completed_at else None,
    }

    # If paused or blocked, set can_proceed flag
    if new_status == TransactionStatus.PAUSED.value:
        response["can_proceed"] = True  # User can confirm
    elif new_status == TransactionStatus.BLOCKED.value:
        response["can_proceed"] = False  # Must wait for admin

    return response


async def confirm_transaction(user_id: str, txn_id: str) -> dict:
    """
    User confirms a paused transaction after seeing the risk warning.
    Only the owner can confirm, and only if status is 'paused'.
    """
    db = get_database()
    now = datetime.now(timezone.utc)

    txn = await db.transactions.find_one({
        "_id": ObjectId(txn_id),
        "user_id": user_id,  # Data isolation — only owner can confirm
    })

    if not txn:
        raise NotFoundException("Transaction")

    if txn["status"] != TransactionStatus.PAUSED.value:
        raise BadRequestException(
            f"Transaction cannot be confirmed. Current status: {txn['status']}"
        )

    # Deduct balance
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user.get("balance", 0) < txn["amount"]:
        raise BadRequestException("Insufficient balance")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"balance": -txn["amount"]}, "$set": {"updated_at": now}}
    )

    # Update transaction status to completed
    await db.transactions.update_one(
        {"_id": ObjectId(txn_id)},
        {"$set": {
            "status": TransactionStatus.COMPLETED.value,
            "updated_at": now,
            "completed_at": now,
        }}
    )

    return {
        "id": txn_id,
        "status": TransactionStatus.COMPLETED.value,
        "message": "Transaction confirmed and completed successfully",
    }


async def cancel_transaction(user_id: str, txn_id: str) -> dict:
    """
    User cancels a paused transaction.
    Only the owner can cancel, and only if status is 'paused'.
    """
    db = get_database()
    now = datetime.now(timezone.utc)

    txn = await db.transactions.find_one({
        "_id": ObjectId(txn_id),
        "user_id": user_id,
    })

    if not txn:
        raise NotFoundException("Transaction")

    if txn["status"] != TransactionStatus.PAUSED.value:
        raise BadRequestException(
            f"Transaction cannot be cancelled. Current status: {txn['status']}"
        )

    await db.transactions.update_one(
        {"_id": ObjectId(txn_id)},
        {"$set": {
            "status": TransactionStatus.CANCELLED.value,
            "updated_at": now,
        }}
    )

    return {
        "id": txn_id,
        "status": TransactionStatus.CANCELLED.value,
        "message": "Transaction cancelled",
    }


async def get_transaction_history(
    user_id: str,
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
) -> dict:
    """
    Get paginated transaction history for a user.
    Data isolation: only shows transactions belonging to the authenticated user.
    """
    db = get_database()

    query = {"user_id": user_id}
    if status_filter:
        query["status"] = status_filter

    total = await db.transactions.count_documents(query)
    skip = (page - 1) * page_size

    cursor = db.transactions.find(query).sort("created_at", -1).skip(skip).limit(page_size)

    transactions = []
    async for txn in cursor:
        transactions.append({
            "id": str(txn["_id"]),
            "payee_upi": txn["payee_upi"],
            "payee_name": txn["payee_name"],
            "amount": txn["amount"],
            "currency": txn.get("currency", "INR"),
            "status": txn["status"],
            "risk_score": txn.get("risk_score"),
            "risk_level": txn.get("risk_level"),
            "risk_explanation": txn.get("risk_explanation"),
            "risk_factors": txn.get("risk_factors", []),
            "device_changed": txn.get("device_changed", False),
            "model_type": txn.get("model_type", "unknown"),
            "created_at": txn["created_at"].isoformat(),
            "completed_at": txn["completed_at"].isoformat() if txn.get("completed_at") else None,
        })

    return {
        "transactions": transactions,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_more": (skip + page_size) < total,
    }


async def get_transaction_detail(user_id: str, txn_id: str) -> dict:
    """
    Get a single transaction's full details including risk explanation.
    Data isolation: only the owner can view their transaction.
    """
    db = get_database()

    txn = await db.transactions.find_one({
        "_id": ObjectId(txn_id),
        "user_id": user_id,
    })

    if not txn:
        raise NotFoundException("Transaction")

    return {
        "id": str(txn["_id"]),
        "payee_upi": txn["payee_upi"],
        "payee_name": txn["payee_name"],
        "amount": txn["amount"],
        "currency": txn.get("currency", "INR"),
        "status": txn["status"],
        "risk_score": txn.get("risk_score"),
        "risk_level": txn.get("risk_level"),
        "risk_explanation": txn.get("risk_explanation"),
        "risk_factors": txn.get("risk_factors", []),
        "device_changed": txn.get("device_changed", False),
        "model_type": txn.get("model_type", "unknown"),
        "created_at": txn["created_at"].isoformat(),
        "completed_at": txn["completed_at"].isoformat() if txn.get("completed_at") else None,
    }


async def _build_user_history(user_id: str, user: dict) -> dict:
    """
    Build the user's transaction history context for the ML model.
    This is the 'raw txn + account context' from the workflow diagram.
    """
    db = get_database()

    # Get transaction statistics
    pipeline = [
        {"$match": {"user_id": user_id, "status": "completed"}},
        {"$group": {
            "_id": None,
            "avg_amount": {"$avg": "$amount"},
            "max_amount": {"$max": "$amount"},
            "total_count": {"$sum": 1},
            "total_volume": {"$sum": "$amount"},
        }}
    ]
    stats = None
    async for doc in db.transactions.aggregate(pipeline):
        stats = doc

    # Get recent transactions (last 20)
    cursor = db.transactions.find(
        {"user_id": user_id, "status": "completed"}
    ).sort("created_at", -1).limit(20)

    recent_txns = []
    async for txn in cursor:
        recent_txns.append({
            "amount": txn["amount"],
            "payee_upi": txn["payee_upi"],
            "created_at": txn["created_at"].isoformat(),
            "risk_score": txn.get("risk_score", 0),
        })

    # Get unique payees
    payee_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$payee_upi"}},
    ]
    known_payees = set()
    async for doc in db.transactions.aggregate(payee_pipeline):
        known_payees.add(doc["_id"])

    # Get device history
    device_cursor = db.device_fingerprints.find({"user_id": user_id})
    known_devices = set()
    async for doc in device_cursor:
        known_devices.add(doc["fingerprint_hash"])

    # Count recent transactions (last 5 minutes) for rapid succession detection
    from datetime import timedelta
    five_min_ago = datetime.now(timezone.utc) - timedelta(minutes=5)
    recent_count = await db.transactions.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": five_min_ago}
    })

    return {
        "avg_amount": stats["avg_amount"] if stats else 0,
        "max_amount": stats["max_amount"] if stats else 0,
        "total_transactions": stats["total_count"] if stats else 0,
        "total_volume": stats["total_volume"] if stats else 0,
        "recent_transactions": recent_txns,
        "known_payees": list(known_payees),
        "known_devices": list(known_devices),
        "recent_txn_count_5min": recent_count,
        "account_age_days": (datetime.now(timezone.utc) - (user.get("created_at").replace(tzinfo=timezone.utc) if user.get("created_at") and user.get("created_at").tzinfo is None else user.get("created_at") or datetime.now(timezone.utc))).days,
        "registered_device": user.get("device_fingerprint"),
    }
