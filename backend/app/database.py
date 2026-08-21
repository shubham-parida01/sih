"""
MongoDB Atlas async connection using Motor driver.
Handles connection lifecycle, database access, and index creation.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING, DESCENDING
from app.config import settings

# Global database client and database reference
client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_mongodb():
    """Initialize MongoDB connection and create indexes."""
    global client, db

    print(f"[*] Connecting to MongoDB: {settings.MONGODB_URI[:30]}...")

    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        maxPoolSize=50,
        minPoolSize=10,
        serverSelectionTimeoutMS=10000,
    )
    db = client[settings.DATABASE_NAME]

    # Verify connection
    try:
        await client.admin.command("ping")
        print(f"[OK] Connected to MongoDB Atlas -- database: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")
        print("[INFO] Make sure your MONGODB_URI in .env is correct.")
        print("[INFO] Get your Atlas URI from: MongoDB Atlas > Connect > Connect your application")
        raise

    # Create indexes for data isolation and performance
    await _create_indexes()


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
