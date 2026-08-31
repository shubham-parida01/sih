"""
Risk client — HTTP client for calling the ML risk scoring microservice.
Handles communication between backend and ml_service with retry logic and fail-safe defaults.
"""

import httpx
from typing import Optional

from app.config import settings
from app.utils.exceptions import ServiceUnavailableException


# Reusable async HTTP client
_http_client: Optional[httpx.AsyncClient] = None


async def get_http_client() -> httpx.AsyncClient:
    """Get or create the shared HTTP client."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            base_url=settings.ML_SERVICE_URL,
            timeout=httpx.Timeout(60.0, connect=50.0),
        )
    return _http_client


async def close_http_client():
    """Close the HTTP client gracefully."""
    global _http_client
    if _http_client and not _http_client.is_closed:
        await _http_client.aclose()


async def score_transaction(transaction_data: dict, user_history: dict) -> dict:
    """
    Call the ML microservice to score a transaction for fraud risk.

    Args:
        transaction_data: Transaction details (amount, payee, device, etc.)
        user_history: User's transaction history and behavioral context.

    Returns:
        Risk scoring result with score, level, explanation, and factors.

    Falls back to MEDIUM risk if ML service is unavailable (fail-safe).
    """
    payload = {
        "transaction": transaction_data,
        "user_history": user_history,
    }

    # Retry logic: local ML service first, then remote production ML service fallback
    target_urls = [settings.ML_SERVICE_URL, "https://sih-ml-service-ibak.onrender.com"]

    for base_url in target_urls:
        try:
            async with httpx.AsyncClient(base_url=base_url, timeout=httpx.Timeout(30.0, connect=10.0)) as client:
                response = await client.post("/api/risk/score", json=payload)
                if response.status_code == 200:
                    return response.json()
                print(f"[WARN] ML service at {base_url} returned {response.status_code}")
        except Exception as e:
            print(f"[WARN] ML service at {base_url} unreachable: {e}")

    # Fail-safe: Raise a ServiceUnavailableException if both local and remote ML endpoints fail
    print("[ERROR] ML service unreachable on all endpoints -- throwing ServiceUnavailableException")
    raise ServiceUnavailableException(
        detail="Risk assessment service temporarily offline. Please try again."
    )


async def check_device(user_id: str, current_fingerprint: str) -> dict:
    """
    Check if the device fingerprint has changed from the registered device.
    """
    payload = {
        "user_id": user_id,
        "current_fingerprint": current_fingerprint,
    }

    try:
        client = await get_http_client()
        response = await client.post("/api/risk/device-check", json=payload)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"[WARN] Device check failed: {e}")

    # Default: assume no device change if service is down
    return {"device_changed": False, "risk_contribution": 0}


async def get_explanation(transaction_id: str, risk_data: dict) -> dict:
    """
    Get detailed explainability data for a risk score.
    Uses Integrated Gradients on the ONNX model graph.
    """
    payload = {
        "transaction_id": transaction_id,
        "risk_data": risk_data,
    }

    try:
        client = await get_http_client()
        response = await client.post("/api/risk/explain", json=payload)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"[WARN] Explainability service error: {e}")

    return {"explanation": "Detailed explanation unavailable", "factors": []}
