"""
Risk router — ML microservice API endpoints for risk scoring, explainability, and detection.
"""

from fastapi import APIRouter

from app.schemas.risk_schemas import (
    RiskScoreRequest,
    RiskScoreResponse,
    DeviceCheckRequest,
    DeviceCheckResponse,
    ExplainRequest,
    BehaviorCheckRequest,
)
from app.models.risk_scorer import score_transaction
from app.models.device_analyzer import analyze_device
from app.models.behavior_analyzer import analyze_behavior
from app.models.voice_detector import detect_voice_phishing

router = APIRouter(prefix="/api/risk", tags=["Risk Scoring"])


@router.post("/score")
async def risk_score(request: RiskScoreRequest):
    """
    Score a transaction for fraud risk.

    Pipeline:
    1. Feature Builder — extract features from raw txn + account context
       (freq-encode, one-hot, scale)
    2. Risk Scoring Service — run inference
       (currently rule-based, will use onnxruntime + student_model.onnx)

    Returns risk score (0-100), level, explanation, and contributing factors.
    """
    result = score_transaction(
        transaction=request.transaction.model_dump(),
        user_history=request.user_history.model_dump(),
    )

    return result


@router.post("/device-check")
async def device_check(request: DeviceCheckRequest):
    """
    Check if the device fingerprint has changed from the registered device.
    Returns risk contribution score.
    """
    result = analyze_device(
        current_fingerprint=request.current_fingerprint,
        registered_fingerprint=None,  # Would come from DB in production
        known_devices=[],
    )

    return result


@router.post("/explain")
async def explain_risk(request: ExplainRequest):
    """
    Get detailed explainability data for a risk score.

    When ONNX model is integrated, this will use:
    - Integrated Gradients on the ONNX model graph
    - explain_student.py for feature attribution

    Currently returns the risk factors from the scoring step.
    """
    risk_data = request.risk_data

    # For now, return the factors from scoring
    # When ML model is ready, replace with Integrated Gradients
    return {
        "transaction_id": request.transaction_id,
        "explanation_method": "rule_based",  # Will be "integrated_gradients" with ML
        "factors": risk_data.get("factors", []),
        "feature_importances": {},  # Will be populated by Integrated Gradients
        "model_version": "rule_based_v1",
    }


@router.post("/behavior-check")
async def behavior_check(request: BehaviorCheckRequest):
    """
    Analyze payment behavior patterns for anomalies.
    Checks transaction frequency, amount distribution, and velocity.
    """
    result = analyze_behavior(
        transaction=request.transaction.model_dump(),
        user_history=request.user_history.model_dump(),
    )

    return result


@router.post("/voice-analyze")
async def voice_analyze(transcript: str = None):
    """
    Voice phishing detection endpoint.

    STUB — basic keyword matching until ML model is integrated.
    When ready, this will accept audio features or transcripts
    and run inference on a trained NLP model.
    """
    result = detect_voice_phishing(transcript=transcript)
    return result
