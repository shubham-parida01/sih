"""
ML Risk Scoring Microservice — Main Entry Point
SIH 2026: Explainable Real-Time Fraud Shield for UPI

Separate FastAPI service that handles:
- Risk Scoring (onnxruntime + student_model.onnx, ~8KB, <1ms/txn)
- Feature Engineering (freq-encode, one-hot, scale)
- Explainability (Integrated Gradients on ONNX graph)
- Device Change Detection
- Behavior Analysis
- Voice Phishing Detection (stub)

This service is called by the main backend via HTTP.
Not exposed to the public internet — internal service only.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.config import ml_settings
from app.routers import risk
from app.models.risk_scorer import get_onnx_session

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[*] Starting ML Risk Scoring Service...")
    # Trigger model loading on startup
    session = get_onnx_session()
    if session:
        print("[OK] ONNX Model loaded successfully and ready!")
    else:
        print("[WARN] Running in fallback mode (rule-based).")
    yield

app = FastAPI(
    title="SIH 2026 — ML Risk Scoring Service",
    description=(
        "Internal microservice for fraud risk scoring. "
        "Uses rule-based scoring (swappable with ONNX ML model). "
        "Called by the main backend service."
    ),
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan,
)

# Include risk router
app.include_router(risk.router)


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint."""
    return {
        "service": "ML Risk Scoring Service",
        "status": "running",
        "version": "1.0.0",
        "model": "rule_based_v1",  # Will be "student_model.onnx" when ML is ready
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": True,  # Rule-based is always "loaded"
        "model_type": "rule_based",  # Will be "onnx" when ML model is integrated
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=ml_settings.HOST,
        port=ml_settings.PORT,
        reload=True,
    )
