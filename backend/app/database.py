"""
MongoDB Atlas async connection using Motor driver.
Handles connection lifecycle, database access, and index creation.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING, DESCENDING
from app.config import settings

import certifi

# Global database client and database reference
client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_mongodb():
    """Initialize MongoDB connection and create indexes with SSL fallback for Windows."""
    global client, db

    print("[*] Connecting to MongoDB...")

    try:
        # Attempt standard TLS connection with certifi CA bundle
        client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            maxPoolSize=50,
            minPoolSize=10,
            serverSelectionTimeoutMS=10000,
            tlsCAFile=certifi.where(),
        )
        db = client[settings.DATABASE_NAME]
        await client.admin.command("ping")
        print(f"[OK] Connected to MongoDB Atlas -- database: {settings.DATABASE_NAME}")
    except Exception as primary_err:
        print(f"[*] TLS CA handshake failed ({primary_err}), attempting Windows TLS fallback...")
        try:
            client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                maxPoolSize=50,
                minPoolSize=10,
                serverSelectionTimeoutMS=10000,
                tlsAllowInvalidCertificates=True,
            )
            db = client[settings.DATABASE_NAME]
            await client.admin.command("ping")
            print(f"[OK] Connected to MongoDB Atlas via TLS fallback -- database: {settings.DATABASE_NAME}")
        except Exception as fallback_err:
            print(f"[ERROR] Failed to connect to MongoDB: {fallback_err}")
            print("[INFO] Make sure your MONGODB_URI in .env is correct and IP whitelist includes your IP.")
            raise fallback_err

    # Create indexes for data isolation and performance
    try:
        await _create_indexes()
    except Exception as e:
        print(f"[*] Rebuilding index schema due to conflict: {e}")
        try:
            await db.users.drop_indexes()
            await _create_indexes()
        except Exception as err:
            print(f"[WARNING] Could not drop/recreate indexes: {err}")


async def close_mongodb_connection():
    """Close MongoDB connection gracefully."""
    global client
    if client:
        client.close()
        print("[OK] MongoDB connection closed")


async def _create_indexes():
    """Create all required indexes for data isolation and query performance."""

    # Users collection — unique constraints
    await db.users.create_indexes([
        IndexModel([("email", ASCENDING)], unique=True),
        IndexModel([("phone", ASCENDING)], unique=True, sparse=True),
        IndexModel([("upi_id", ASCENDING)], unique=True, sparse=True),
        IndexModel([("role", ASCENDING)]),
    ])

    # Transactions collection — user isolation + query performance
    await db.transactions.create_indexes([
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)]),
        IndexModel([("user_id", ASCENDING), ("status", ASCENDING)]),
        IndexModel([("payee_upi", ASCENDING), ("created_at", DESCENDING)]),
        IndexModel([("status", ASCENDING), ("created_at", DESCENDING)]),
        IndexModel([("risk_level", ASCENDING)]),
    ])

    # Risk scores collection
    await db.risk_scores.create_indexes([
        IndexModel([("transaction_id", ASCENDING)], unique=True),
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)]),
    ])

    # Device fingerprints collection
    await db.device_fingerprints.create_indexes([
        IndexModel([("user_id", ASCENDING)]),
        IndexModel([("fingerprint_hash", ASCENDING)]),
    ])

    # Alerts collection — admin queries
    await db.alerts.create_indexes([
        IndexModel([("status", ASCENDING), ("created_at", DESCENDING)]),
        IndexModel([("user_id", ASCENDING)]),
        IndexModel([("transaction_id", ASCENDING)]),
    ])

    # Webhook delivery logs
    await db.webhook_logs.create_indexes([
        IndexModel([("alert_id", ASCENDING)]),
        IndexModel([("status", ASCENDING), ("created_at", DESCENDING)]),
    ])

    # Audit logs
    await db.audit_logs.create_indexes([
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)]),
        IndexModel([("action", ASCENDING)]),
    ])

    print("[OK] Database indexes created/verified")


def get_database() -> AsyncIOMotorDatabase:
    """Get the database instance. Used as a FastAPI dependency."""
    return db
