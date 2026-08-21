"""
User service — handles user profile CRUD and dashboard data.
All queries are scoped to the authenticated user's ID for data isolation.
"""

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from app.database import get_database
from app.utils.exceptions import NotFoundException


async def get_user_profile(user_id: str) -> dict:
    """Get the full profile for the authenticated user."""
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise NotFoundException("User")

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user["full_name"],
        "phone": user.get("phone"),
        "upi_id": user.get("upi_id"),
        "balance": user.get("balance", 0.0),
        "is_active": user.get("is_active", True),
        "profile": user.get("profile", {}),
        "created_at": user["created_at"].isoformat(),
        "updated_at": user["updated_at"].isoformat(),
    }


async def update_user_profile(user_id: str, updates: dict) -> dict:
    """
    Update user profile fields.
    Only updates provided (non-None) fields.
    """
    db = get_database()

    # Build update dict, skipping None values
    update_fields = {}
    for key in ["full_name", "phone", "upi_id"]:
        if key in updates and updates[key] is not None:
            update_fields[key] = updates[key]

    # Handle nested profile fields
    for key in ["address", "avatar_url"]:
        if key in updates and updates[key] is not None:
            update_fields[f"profile.{key}"] = updates[key]

    if not update_fields:
        return await get_user_profile(user_id)

    update_fields["updated_at"] = datetime.now(timezone.utc)

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields}
    )

    return await get_user_profile(user_id)


async def get_user_dashboard(user_id: str) -> dict:
    """
    Get the personal home page dashboard data (Paytm-style).
    Includes balance, recent transactions, and risk summary.
    """
    db = get_database()

    # Get user info
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise NotFoundException("User")

    # Get recent transactions (last 10)
    cursor = db.transactions.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(10)
    recent_txns = []
    async for txn in cursor:
        recent_txns.append({
            "id": str(txn["_id"]),
            "payee_upi": txn["payee_upi"],
            "payee_name": txn["payee_name"],
            "amount": txn["amount"],
            "status": txn["status"],
            "risk_level": txn.get("risk_level"),
            "created_at": txn["created_at"].isoformat(),
        })

    # Get total transaction count
    total_txns = await db.transactions.count_documents({"user_id": user_id})

    # Risk summary aggregation
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$risk_level",
            "count": {"$sum": 1}
        }}
    ]
    risk_counts = {}
    async for doc in db.transactions.aggregate(pipeline):
        if doc["_id"]:
            risk_counts[doc["_id"]] = doc["count"]

    return {
        "full_name": user["full_name"],
        "balance": user.get("balance", 0.0),
        "upi_id": user.get("upi_id"),
        "recent_transactions": recent_txns,
        "total_transactions": total_txns,
        "risk_summary": {
            "low": risk_counts.get("low", 0),
            "medium": risk_counts.get("medium", 0),
            "high": risk_counts.get("high", 0),
            "critical": risk_counts.get("critical", 0),
        }
    }


async def register_device_fingerprint(
    user_id: str,
    fingerprint_hash: str,
    device_name: Optional[str] = None,
    device_os: Optional[str] = None,
    app_version: Optional[str] = None,
) -> dict:
    """
    Register or update a device fingerprint for the user.
    Used for device change detection in risk scoring.
    """
    db = get_database()
    now = datetime.now(timezone.utc)

    # Update user's current device fingerprint
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "device_fingerprint": fingerprint_hash,
            "updated_at": now,
        }}
    )

    # Store in device_fingerprints collection for history
    device_doc = {
        "user_id": user_id,
        "fingerprint_hash": fingerprint_hash,
        "device_name": device_name,
        "device_os": device_os,
        "app_version": app_version,
        "registered_at": now,
    }

    # Upsert — update if same fingerprint exists, insert if new
    await db.device_fingerprints.update_one(
        {"user_id": user_id, "fingerprint_hash": fingerprint_hash},
        {"$set": device_doc},
        upsert=True,
    )

    return {"status": "registered", "fingerprint_hash": fingerprint_hash}


async def get_user_balance(user_id: str) -> dict:
    """Get the user's current balance."""
    db = get_database()
    user = await db.users.find_one(
        {"_id": ObjectId(user_id)},
        {"balance": 1, "full_name": 1}
    )
    if not user:
        raise NotFoundException("User")

    return {
        "balance": user.get("balance", 0.0),
        "currency": "INR",
        "full_name": user["full_name"],
    }
