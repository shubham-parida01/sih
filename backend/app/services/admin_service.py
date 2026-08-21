"""
Admin service — handles admin dashboard queries, account management, and alert reviews.
Returns data in formats matching the frontend chart specifications.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional

from bson import ObjectId

from app.database import get_database
from app.models.transaction import TransactionStatus
from app.models.alert import AlertStatus
from app.services.websocket_manager import ws_manager
from app.utils.exceptions import NotFoundException, BadRequestException


async def get_admin_dashboard() -> dict:
    """
    Get the main admin dashboard overview data.
    Returns risk distribution, score trend, and recent alerts.
    """
    db = get_database()

    # Total counts
    total_users = await db.users.count_documents({"role": "user"})
    total_transactions = await db.transactions.count_documents({})
    total_flagged = await db.transactions.count_documents({
        "status": {"$in": ["paused", "blocked", "admin_review"]}
    })
    total_blocked = await db.transactions.count_documents({"status": "blocked"})
    pending_reviews = await db.alerts.count_documents({"status": "pending"})

    # Risk distribution for PieChart (matching frontend format)
    risk_distribution = await _build_risk_distribution()

    # 7-day score trend for LineChart
    score_trend = await _build_score_trend()

    # Recent alerts (last 10)
    cursor = db.alerts.find({"status": "pending"}).sort("created_at", -1).limit(10)
    recent_alerts = []
    async for alert in cursor:
        # Get user info for the alert
        user = await db.users.find_one({"_id": ObjectId(alert["user_id"])}) if alert.get("user_id") else None
        recent_alerts.append({
            "id": str(alert["_id"]),
            "transaction_id": alert["transaction_id"],
            "user_id": alert["user_id"],
            "user_name": user.get("full_name", "Unknown") if user else "Unknown",
            "alert_type": alert["alert_type"],
            "risk_score": alert["risk_score"],
            "risk_explanation": alert.get("risk_explanation", ""),
            "status": alert["status"],
            "created_at": alert["created_at"].isoformat(),
        })

    return {
        "total_users": total_users,
        "total_transactions": total_transactions,
        "total_flagged": total_flagged,
        "total_blocked": total_blocked,
        "pending_reviews": pending_reviews,
        "risk_distribution": risk_distribution,
        "score_trend": score_trend,
        "recent_alerts": recent_alerts,
    }


async def _build_risk_distribution() -> dict:
    """
    Build risk distribution data matching frontend PieChart format.
    Format: { totalValue, totalLabel, slices: [{ name, value, count, percent, sliceColor, dotColor }] }
    """
    db = get_database()

    pipeline = [
        {"$group": {
            "_id": "$risk_level",
            "count": {"$sum": 1}
        }}
    ]

    counts = {"low": 0, "medium": 0, "high": 0}
    under_review = 0

    async for doc in db.transactions.aggregate(pipeline):
        level = doc["_id"]
        if level in counts:
            counts[level] = doc["count"]

    # Count under-review transactions
    under_review = await db.transactions.count_documents({
        "status": {"$in": ["paused", "blocked", "admin_review"]}
    })

    total = sum(counts.values()) + under_review
    if total == 0:
        total = 1  # Avoid division by zero

    slices = [
        {
            "name": "Low risk",
            "value": counts["low"],
            "count": str(counts["low"]),
            "percent": f"{(counts['low'] / total * 100):.1f}%",
            "sliceColor": "#beff50",
            "dotColor": "bg-primary",
        },
        {
            "name": "Medium risk",
            "value": counts["medium"],
            "count": str(counts["medium"]),
            "percent": f"{(counts['medium'] / total * 100):.1f}%",
            "sliceColor": "#e7b631",
            "dotColor": "bg-amber-400",
        },
        {
            "name": "High risk",
            "value": counts["high"],
            "count": str(counts["high"]),
            "percent": f"{(counts['high'] / total * 100):.1f}%",
            "sliceColor": "#db5547",
            "dotColor": "bg-red-500",
        },
        {
            "name": "Under review",
            "value": under_review,
            "count": str(under_review),
            "percent": f"{(under_review / total * 100):.1f}%",
            "sliceColor": "#92938a",
            "dotColor": "bg-stone-400",
        },
    ]

    return {
        "totalValue": f"{total:,}",
        "totalLabel": "Total transactions",
        "slices": slices,
    }


async def _build_score_trend() -> list:
    """
    Build 7-day risk score trend for LineChart.
    Format: [{ day: "12 May", score: 46 }, ...]
    """
    db = get_database()
    trend = []
    now = datetime.now(timezone.utc)

    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        pipeline = [
            {"$match": {
                "created_at": {"$gte": day_start, "$lt": day_end},
                "risk_score": {"$ne": None},
            }},
            {"$group": {
                "_id": None,
                "avg_score": {"$avg": "$risk_score"},
            }}
        ]

        avg_score = 0
        async for doc in db.transactions.aggregate(pipeline):
            avg_score = round(doc["avg_score"], 1)

        trend.append({
            "day": day.strftime("%d %b"),
            "score": avg_score,
        })

    return trend


async def get_all_accounts(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
) -> dict:
    """
    Get all user accounts for admin homepage (accounts by branch).
    """
    db = get_database()

    query = {"role": "user"}
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"upi_id": {"$regex": search, "$options": "i"}},
        ]

    total = await db.users.count_documents(query)
    skip = (page - 1) * page_size

    cursor = db.users.find(query).sort("created_at", -1).skip(skip).limit(page_size)
    users = await cursor.to_list(length=page_size)

    user_ids = [str(user["_id"]) for user in users]
    stats_by_user = {}
    if user_ids:
        stats_pipeline = [
            {"$match": {"user_id": {"$in": user_ids}}},
            {"$group": {
                "_id": "$user_id",
                "total": {"$sum": 1},
                "avg_risk": {"$avg": {"$ifNull": ["$risk_score", 0]}},
            }},
        ]
        async for doc in db.transactions.aggregate(stats_pipeline):
            stats_by_user[doc["_id"]] = doc

    accounts = []
    for user in users:
        user_id = str(user["_id"])
        stats = stats_by_user.get(user_id)

        avg_risk = stats["avg_risk"] if stats else 0
        risk_level = "low"
        if avg_risk >= 60:
            risk_level = "high"
        elif avg_risk >= 30:
            risk_level = "medium"

        accounts.append({
            "id": user_id,
            "full_name": user["full_name"],
            "email": user["email"],
            "upi_id": user.get("upi_id"),
            "balance": user.get("balance", 0),
            "total_transactions": stats["total"] if stats else 0,
            "avg_risk_score": round(avg_risk, 2),
            "risk_level": risk_level,
            "last_active": user.get("updated_at", user["created_at"]).isoformat(),
        })

    return {
        "accounts": accounts,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


async def get_account_detail(user_id: str) -> dict:
    """
    Get the Specific Account Panel data for admin view.
    Includes transaction chart data, risk score overlay, and account details.
    """
    db = get_database()

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise NotFoundException("Account")

    uid = str(user["_id"])

    # Get transaction stats
    stats_pipeline = [
        {"$match": {"user_id": uid}},
        {"$group": {
            "_id": None,
            "total": {"$sum": 1},
            "avg_risk": {"$avg": {"$ifNull": ["$risk_score", 0]}},
        }}
    ]
    stats = None
    async for doc in db.transactions.aggregate(stats_pipeline):
        stats = doc

    avg_risk = stats["avg_risk"] if stats else 0
    risk_level = "low"
    if avg_risk >= 60:
        risk_level = "high"
    elif avg_risk >= 30:
        risk_level = "medium"

    account_summary = {
        "id": uid,
        "full_name": user["full_name"],
        "email": user["email"],
        "upi_id": user.get("upi_id"),
        "balance": user.get("balance", 0),
        "total_transactions": stats["total"] if stats else 0,
        "avg_risk_score": round(avg_risk, 2),
        "risk_level": risk_level,
        "last_active": user.get("updated_at", user["created_at"]).isoformat(),
    }

    # Account trend (monthly risk score area chart)
    account_trend = await _build_account_trend(uid)

    # Transaction chart (bar graph: dated txn values)
    transaction_chart = await _build_transaction_chart(uid)

    # Risk score overlay (line graph)
    risk_overlay = await _build_risk_overlay(uid)

    # Avg risk score as payee
    avg_as_payee = await _calc_avg_risk_as_payee(user.get("upi_id"))

    # Recent transactions
    cursor = db.transactions.find({"user_id": uid}).sort("created_at", -1).limit(20)
    recent_txns = []
    async for txn in cursor:
        recent_txns.append({
            "id": str(txn["_id"]),
            "payee_upi": txn["payee_upi"],
            "payee_name": txn["payee_name"],
            "amount": txn["amount"],
            "status": txn["status"],
            "risk_score": txn.get("risk_score"),
            "risk_level": txn.get("risk_level"),
            "created_at": txn["created_at"].isoformat(),
        })

    return {
        "account": account_summary,
        "account_trend": account_trend,
        "transaction_chart": transaction_chart,
        "risk_score_overlay": risk_overlay,
        "avg_risk_score_as_payee": round(avg_as_payee, 2),
        "recent_transactions": recent_txns,
        "total_transactions": stats["total"] if stats else 0,
    }


async def _build_account_trend(user_id: str) -> list:
    """
    Build monthly risk score area chart data.
    Format: [{ month: "Jan", score: 44 }, ...]
    """
    db = get_database()
    trend = []
    now = datetime.now(timezone.utc)

    for i in range(5, -1, -1):
        month_start = (now - timedelta(days=30 * i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if i > 0:
            month_end = (now - timedelta(days=30 * (i - 1))).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            month_end = now

        pipeline = [
            {"$match": {
                "user_id": user_id,
                "created_at": {"$gte": month_start, "$lt": month_end},
                "risk_score": {"$ne": None},
            }},
            {"$group": {"_id": None, "avg": {"$avg": "$risk_score"}}}
        ]

        avg = 0
        async for doc in db.transactions.aggregate(pipeline):
            avg = round(doc["avg"], 1)

        trend.append({
            "month": month_start.strftime("%b"),
            "score": avg,
        })

    return trend


async def _build_transaction_chart(user_id: str) -> list:
    """Build dated transaction values for bar graph."""
    db = get_database()
    chart = []
    now = datetime.now(timezone.utc)

    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        pipeline = [
            {"$match": {
                "user_id": user_id,
                "created_at": {"$gte": day_start, "$lt": day_end},
            }},
            {"$group": {
                "_id": None,
                "total_value": {"$sum": "$amount"},
                "count": {"$sum": 1},
            }}
        ]

        total_value = 0
        count = 0
        async for doc in db.transactions.aggregate(pipeline):
            total_value = doc["total_value"]
            count = doc["count"]

        chart.append({
            "date": day.strftime("%d %b"),
            "value": round(total_value, 2),
            "count": count,
        })

    return chart


async def _build_risk_overlay(user_id: str) -> list:
    """Build risk score over time for line graph overlay."""
    db = get_database()
    overlay = []
    now = datetime.now(timezone.utc)

    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        pipeline = [
            {"$match": {
                "user_id": user_id,
                "created_at": {"$gte": day_start, "$lt": day_end},
                "risk_score": {"$ne": None},
            }},
            {"$group": {"_id": None, "avg": {"$avg": "$risk_score"}}}
        ]

        avg = 0
        async for doc in db.transactions.aggregate(pipeline):
            avg = round(doc["avg"], 1)

        overlay.append({
            "date": day.strftime("%d %b"),
            "score": avg,
        })

    return overlay


async def _calc_avg_risk_as_payee(upi_id: Optional[str]) -> float:
    """Calculate average risk score for transactions where this user was the payee."""
    if not upi_id:
        return 0.0

    db = get_database()

    pipeline = [
        {"$match": {"payee_upi": upi_id, "risk_score": {"$ne": None}}},
        {"$group": {"_id": None, "avg": {"$avg": "$risk_score"}}}
    ]

    async for doc in db.transactions.aggregate(pipeline):
        return doc["avg"]

    return 0.0


async def get_weekly_volume() -> list:
    """
    Build weekly transaction throughput data for dual bar chart.
    Format: [{ day: "Mon", cleared: 362, review: 18 }, ...]
    """
    db = get_database()
    volume = []
    now = datetime.now(timezone.utc)

    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        cleared = await db.transactions.count_documents({
            "created_at": {"$gte": day_start, "$lt": day_end},
            "status": "completed",
        })

        review = await db.transactions.count_documents({
            "created_at": {"$gte": day_start, "$lt": day_end},
            "status": {"$in": ["paused", "blocked", "admin_review"]},
        })

        volume.append({
            "day": day_names[day.weekday()],
            "cleared": cleared,
            "review": review,
        })

    return volume


async def get_risk_reasons() -> list:
    """
    Build horizontal risk reasons bar chart data.
    Format: [{ name: "Reason", value: 42 }, ...]
    """
    db = get_database()

    # Aggregate risk factors across all flagged transactions
    pipeline = [
        {"$match": {"risk_factors": {"$ne": []}}},
        {"$unwind": "$risk_factors"},
        {"$group": {
            "_id": "$risk_factors.factor",
            "count": {"$sum": 1},
        }},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]

    reasons = []
    async for doc in db.transactions.aggregate(pipeline):
        reasons.append({
            "name": doc["_id"],
            "value": doc["count"],
        })

    # If no data yet, return default categories
    if not reasons:
        reasons = [
            {"name": "Transactions to high-risk entities", "value": 0},
            {"name": "Unusual transaction pattern", "value": 0},
            {"name": "First-time payee (high value)", "value": 0},
            {"name": "Multiple high-value transactions", "value": 0},
            {"name": "Other", "value": 0},
        ]

    return reasons


async def get_alerts(
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
) -> dict:
    """Get paginated alerts for admin review."""
    db = get_database()

    query = {}
    if status_filter:
        query["status"] = status_filter

    total = await db.alerts.count_documents(query)
    skip = (page - 1) * page_size

    cursor = db.alerts.find(query).sort("created_at", -1).skip(skip).limit(page_size)

    alerts = []
    async for alert in cursor:
        user = await db.users.find_one({"_id": ObjectId(alert["user_id"])}) if alert.get("user_id") else None
        alerts.append({
            "id": str(alert["_id"]),
            "transaction_id": alert["transaction_id"],
            "user_id": alert["user_id"],
            "user_name": user.get("full_name", "Unknown") if user else "Unknown",
            "user_email": user.get("email", "") if user else "",
            "alert_type": alert["alert_type"],
            "risk_score": alert["risk_score"],
            "risk_explanation": alert.get("risk_explanation", ""),
            "risk_factors": alert.get("risk_factors", []),
            "status": alert["status"],
            "created_at": alert["created_at"].isoformat(),
            "reviewed_by": alert.get("reviewed_by"),
            "reviewed_at": alert["reviewed_at"].isoformat() if alert.get("reviewed_at") else None,
        })

    return {
        "alerts": alerts,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


async def review_alert(
    alert_id: str,
    admin_id: str,
    action: str,
    review_notes: Optional[str] = None,
) -> dict:
    """
    Admin reviews a flagged alert.
    Actions: approve (complete the txn), reject (fail the txn), false_positive (mark as FP).
    """
    db = get_database()
    now = datetime.now(timezone.utc)

    alert = await db.alerts.find_one({"_id": ObjectId(alert_id)})
    if not alert:
        raise NotFoundException("Alert")

    if alert["status"] != "pending":
        raise BadRequestException(f"Alert already reviewed. Status: {alert['status']}")

    # Map action to alert status and transaction status
    if action == "approve":
        alert_status = AlertStatus.REVIEWED.value
        txn_status = TransactionStatus.COMPLETED.value
    elif action == "reject":
        alert_status = AlertStatus.CONFIRMED_FRAUD.value
        txn_status = TransactionStatus.FAILED.value
    elif action == "false_positive":
        alert_status = AlertStatus.FALSE_POSITIVE.value
        txn_status = TransactionStatus.COMPLETED.value
    else:
        raise BadRequestException(f"Invalid action: {action}")

    # Update alert
    await db.alerts.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": {
            "status": alert_status,
            "reviewed_by": admin_id,
            "reviewed_at": now,
            "review_notes": review_notes,
        }}
    )

    # Update the transaction
    txn_update = {
        "status": txn_status,
        "updated_at": now,
    }

    if txn_status == TransactionStatus.COMPLETED.value:
        txn_update["completed_at"] = now
        # Deduct balance if approving
        txn = await db.transactions.find_one({"_id": ObjectId(alert["transaction_id"])})
        if txn:
            await db.users.update_one(
                {"_id": ObjectId(txn["user_id"])},
                {"$inc": {"balance": -txn["amount"]}, "$set": {"updated_at": now}}
            )

    await db.transactions.update_one(
        {"_id": ObjectId(alert["transaction_id"])},
        {"$set": txn_update}
    )

    # Log the audit action
    await db.audit_logs.insert_one({
        "user_id": admin_id,
        "action": f"alert_{action}",
        "target_id": alert_id,
        "transaction_id": alert["transaction_id"],
        "notes": review_notes,
        "created_at": now,
    })

    return {
        "alert_id": alert_id,
        "status": alert_status,
        "transaction_status": txn_status,
        "message": f"Alert {action}d successfully",
    }


async def get_flagged_transactions(page: int = 1, page_size: int = 20) -> dict:
    """Get all paused/flagged/blocked transactions for admin review."""
    db = get_database()

    query = {
        "status": {"$in": ["paused", "blocked", "admin_review"]}
    }

    total = await db.transactions.count_documents(query)
    skip = (page - 1) * page_size

    cursor = db.transactions.find(query).sort("created_at", -1).skip(skip).limit(page_size)

    transactions = []
    async for txn in cursor:
        user = await db.users.find_one({"_id": ObjectId(txn["user_id"])}) if txn.get("user_id") else None
        transactions.append({
            "id": str(txn["_id"]),
            "user_id": txn["user_id"],
            "user_name": user.get("full_name", "Unknown") if user else "Unknown",
            "payee_upi": txn["payee_upi"],
            "payee_name": txn["payee_name"],
            "amount": txn["amount"],
            "status": txn["status"],
            "risk_score": txn.get("risk_score"),
            "risk_level": txn.get("risk_level"),
            "risk_explanation": txn.get("risk_explanation"),
            "risk_factors": txn.get("risk_factors", []),
            "created_at": txn["created_at"].isoformat(),
        })

    return {
        "transactions": transactions,
        "total": total,
        "page": page,
        "page_size": page_size,
    }
