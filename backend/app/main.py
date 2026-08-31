"""
FastAPI Backend — Main Entry Point
SIH 2026: Explainable Real-Time Fraud Shield for UPI

This is the API Gateway that connects:
- Auth Service (Sign In / Sign Up)
- Payment Service (Pay Someone)
- Account Service (balance, txn history)
- Admin Dashboard + WebSocket notifications
- ML Risk Scoring Microservice (via HTTP)
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import connect_to_mongodb, close_mongodb_connection
from app.services.auth_service import seed_admin
from app.services.risk_client import close_http_client
from app.routers import auth, user, transaction, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle events."""
    # Startup
    print("[*] Starting SIH 2026 Backend...")
    try:
        await connect_to_mongodb()
        await seed_admin()
        print("[OK] Backend ready with MongoDB connection!")
    except Exception as db_err:
        print("\n" + "="*70)
        print(" [!] MONGODB ATLAS CONNECTION NOTICE")
        print(f" Error: {db_err}")
        print(" Cause: MongoDB Atlas rejected connection from your local IP address.")
        print(" Fix Step:")
        print(" 1. Go to https://cloud.mongodb.com")
        print(" 2. Open Network Access -> Click 'Add IP Address'")
        print(" 3. Choose 'Allow Access From Anywhere' (0.0.0.0/0) and click Confirm")
        print("="*70 + "\n")

    print(f"[DOCS] API docs: http://{settings.HOST}:{settings.PORT}/docs")

    yield

    # Shutdown
    print("[*] Shutting down...")
    await close_http_client()
    await close_mongodb_connection()


app = FastAPI(
    title="SIH 2026 — Fraud Shield API",
    description=(
        "Explainable Real-Time Fraud Shield for UPI, "
        "Voice Phishing and Social Engineering. "
        "Privacy-preserving risk engine with dual portals (User + Admin)."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(transaction.router)
app.include_router(admin.router)


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint — health check."""
    return {
        "service": "SIH 2026 Backend",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring."""
    from app.database import db

    # Check MongoDB connection
    db_status = "connected"
    try:
        await db.command("ping")
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "ml_service_url": settings.ML_SERVICE_URL,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
