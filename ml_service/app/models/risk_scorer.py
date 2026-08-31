"""
Risk Scorer — Rule-based & ONNX-based risk scoring engine.
This implementation loads student_model.onnx on startup and runs inference.
It falls back to a robust rule-based heuristic if the model is not found or fails.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import math
import os
import numpy as np

# Try to import onnxruntime for ML model inference
try:
    import onnxruntime as ort
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False
    print("[WARN] onnxruntime not available, running in rule-based mode only.")

# Risk factor weights (tuned for UPI fraud patterns, used in rule-based and fallback modes)
WEIGHTS = {
    "large_amount": 20,         # Amount > user's average x 3
    "new_payee": 15,            # First time paying this UPI ID
    "device_change": 25,        # Different device fingerprint
    "unusual_time": 10,         # Transaction outside normal hours (11PM-6AM)
    "rapid_succession": 20,     # Multiple txns within 5 minutes
    "high_value_new_payee": 15, # High value + new payee combo
    "location_mismatch": 15,    # Different from usual location
    "new_account": 10,          # Account less than 7 days old
}

# Global ONNX Session
_onnx_session: Optional[Any] = None


def get_onnx_session() -> Optional[Any]:
    """Lazy loader for ONNX inference session."""
    global _onnx_session, ONNX_AVAILABLE
    if not ONNX_AVAILABLE:
        return None
    if _onnx_session is None:
        # Determine model path
        from app.config import ml_settings
        model_path = ml_settings.MODEL_PATH
        if os.path.exists(model_path):
            try:
                # Use CPU execution provider for portability
                _onnx_session = ort.InferenceSession(
                    model_path, 
                    providers=['CPUExecutionProvider']
                )
                print(f"[OK] ONNX model loaded successfully from {model_path}")
            except Exception as e:
                print(f"[ERROR] Failed to load ONNX model: {e}")
                _onnx_session = None
        else:
            print(f"[WARN] ONNX model file not found at: {model_path}")
    return _onnx_session


import json

SCALER_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "scaler_config.json")


def _scale_features(features: List[float]) -> List[float]:
    """
    Standardize the 27 features.
    If models/scaler_config.json exists, it uses the exact StandardScaler mean/scale parameters.
    Otherwise, it applies a robust heuristic normalization to bring features into standard range [-3.0, 3.0].
    """
    if os.path.exists(SCALER_CONFIG_PATH):
        try:
            with open(SCALER_CONFIG_PATH, "r") as f:
                config = json.load(f)
            mean = config.get("mean")
            scale = config.get("scale")
            if mean and scale and len(mean) == 27 and len(scale) == 27:
                # StandardScaler formula: (x - mean) / std
                return [(float(x) - float(mean[i])) / max(float(scale[i]), 1e-5) for i, x in enumerate(features)]
        except Exception as e:
            print(f"[WARN] Failed to apply custom StandardScaler config: {e}")

    # Heuristic fallback normalization if no config is available
    # Maps large raw values into reasonable standard scaling ranges (~ -2.0 to 2.0)
    normalized = list(features)
    normalized[0] = features[0] / 5000.0              # amount
    normalized[1] = features[1] / 5000.0              # avg_amount
    normalized[2] = features[2] / 10000.0             # max_amount
    normalized[3] = features[3] / 10.0                # total_txns
    normalized[4] = features[4] / 25000.0             # total_volume
    normalized[5] = features[5] / 2.0                 # recent_txn_count
    normalized[6] = features[6] / 30.0                # account_age
    normalized[10] = features[10] / 90.0              # lat
    normalized[11] = features[11] / 180.0             # lon
    normalized[19] = (features[19] - 12.0) / 6.0      # ist_hour
    
    return normalized


def _build_feature_vector(
    transaction: Dict[str, Any],
    user_history: Dict[str, Any],
) -> np.ndarray:
    """
    Feature Builder — transforms raw transaction and account context into
    a 27-dimensional feature vector expected by the ONNX model.
    """
    amount = float(transaction.get("amount", 0.0))
    avg_amount = float(user_history.get("avg_amount", 0.0))
    max_amount = float(user_history.get("max_amount", 0.0))
    total_txns = float(user_history.get("total_transactions", 0))
    total_volume = float(user_history.get("total_volume", 0.0))
    recent_txn_count = float(user_history.get("recent_txn_count_5min", 0))
    account_age = float(user_history.get("account_age_days", 0))
    
    # Device flags
    current_device = transaction.get("device_fingerprint")
    registered_device = transaction.get("user_registered_device") or user_history.get("registered_device")
    known_devices = user_history.get("known_devices", [])
    
    device_changed = 1.0 if current_device and registered_device and current_device != registered_device else 0.0
    device_is_known = 1.0 if current_device in known_devices else 0.0
    
    # Payee flags
    payee_upi = transaction.get("payee_upi", "")
    known_payees = user_history.get("known_payees", [])
    is_new_payee = 1.0 if payee_upi not in known_payees else 0.0
    
    # Location
    location = transaction.get("location") or {}
    lat = float(location.get("lat") or 0.0)
    lon = float(location.get("lon") or 0.0)
    
    # Time
    current_hour = datetime.now(timezone.utc).hour
    ist_hour = (current_hour + 5.5) % 24  # UTC to IST conversion
    is_night_time = 1.0 if (ist_hour >= 23 or ist_hour < 6) else 0.0
    
    # Construct 27 features
    raw_features = [
        amount,                                           # 1
        avg_amount,                                       # 2
        max_amount,                                       # 3
        total_txns,                                       # 4
        total_volume,                                     # 5
        recent_txn_count,                                 # 6
        account_age,                                      # 7
        device_changed,                                   # 8
        device_is_known,                                  # 9
        is_new_payee,                                     # 10
        lat,                                              # 11
        lon,                                              # 12
        is_night_time,                                    # 13
        amount / (avg_amount + 1e-5),                    # 14: ratio of amount to average
        amount / (max_amount + 1e-5),                    # 15: ratio of amount to max
        float(len(known_devices)),                        # 16: count of devices
        float(len(known_payees)),                         # 17: count of payees
        1.0 if amount > 10000.0 else 0.0,                 # 18: high value threshold
        1.0 if amount > 50000.0 else 0.0,                 # 19: ultra high value
        ist_hour,                                         # 20: transaction hour
        device_changed * is_new_payee,                    # 21: interaction feature
        device_changed * (amount / (avg_amount + 1e-5)),  # 22: interaction feature
        is_new_payee * (amount / (avg_amount + 1e-5)),    # 23: interaction feature
        0.0,                                              # 24: placeholder / voice phishing score
        0.0,                                              # 25: placeholder / location changed
        0.0,                                              # 26: placeholder
        1.0,                                              # 27: constant bias
    ]
    
    scaled_features = _scale_features(raw_features)
    return np.array([scaled_features], dtype=np.float32)


def score_transaction(
    transaction: Dict[str, Any],
    user_history: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Score a transaction for fraud risk.
    Tries to run inference on the ONNX model, falling back to rule-based logic.
    """
    session = get_onnx_session()
    
    if session is not None:
        try:
            # Build feature vector
            features_input = _build_feature_vector(transaction, user_history)
            
            # Run inference
            outputs = session.run(["logit"], {"features": features_input})
            logit = float(outputs[0][0])
            
            # Apply Sigmoid to get probability (clip logit to prevent math overflow)
            clipped_logit = max(-100.0, min(100.0, logit))
            probability = 1.0 / (1.0 + math.exp(-clipped_logit))
            risk_score = round(probability * 100, 1)
            
            # Determine risk level
            if risk_score < 30:
                risk_level = "low"
            elif risk_score < 60:
                risk_level = "medium"
            elif risk_score < 80:
                risk_level = "high"
            else:
                risk_level = "critical"
                
            # Perform rule attribution to explain the ONNX model's output
            factors = _explain_prediction(transaction, user_history, risk_score)
            
            explanation = _generate_explanation(
                risk_level, risk_score, factors, 
                transaction.get("amount", 0), transaction.get("payee_upi", "")
            )
            recommendation = _generate_recommendation(risk_level, factors)
            
            return {
                "risk_score": risk_score,
                "risk_level": risk_level,
                "explanation": explanation,
                "factors": factors,
                "recommendation": recommendation,
                "model_type": "onnx"
            }
            
        except Exception as e:
            print(f"[WARN] ONNX inference failed: {e}. Falling back to rule-based scoring.")
            
    # Fallback to Rule-based heuristics
    return _score_rule_based(transaction, user_history)


def _score_rule_based(
    transaction: Dict[str, Any],
    user_history: Dict[str, Any],
) -> Dict[str, Any]:
    """Weighted rule-based scoring."""
    factors: List[Dict[str, Any]] = []
    total_score = 0.0

    avg_amount = user_history.get("avg_amount", 0)
    amount = transaction.get("amount", 0)

    # ─── Factor 1: Large Amount ───
    if avg_amount > 0 and amount > avg_amount * 3:
        multiplier = round(amount / avg_amount, 1)
        contribution = min(WEIGHTS["large_amount"], WEIGHTS["large_amount"] * (multiplier / 5))
        factors.append({
            "factor": "Unusually large amount",
            "contribution": round(contribution, 1),
            "detail": f"₹{amount:,.0f} is {multiplier}x your average transaction of ₹{avg_amount:,.0f}",
        })
        total_score += contribution

    # ─── Telemetry Vector Checks (Sensor Toggles) ───
    telemetry = transaction.get("telemetry") or {}
    has_telemetry = bool(telemetry)

    active_call = telemetry.get("activeCall") or telemetry.get("call_state_active") or False
    new_device_toggle = telemetry.get("newDevice") or (telemetry.get("device_fingerprint_match") is True) or False
    first_payee_toggle = telemetry.get("firstTimePayee") or (telemetry.get("payee_in_contacts") is False) or False

    # Factor: Active Call
    if active_call:
        contribution = 35.0
        factors.append({
            "factor": "Call State Active (Sensor Override)",
            "contribution": contribution,
            "detail": "Call State Active was changed from False to True (Active phone call detected during payment — Coercion/Vishing risk)",
        })
        total_score += contribution

    # Factor: New Device
    if new_device_toggle or (not has_telemetry and transaction.get("device_fingerprint") and user_history.get("registered_device") and transaction.get("device_fingerprint") != user_history.get("registered_device")):
        contribution = 25.0
        factors.append({
            "factor": "Unrecognized / New Device (Sensor Override)",
            "contribution": contribution,
            "detail": "Device status was changed to New Device (Initiated from an unrecognized device hardware state)",
        })
        total_score += contribution

    # Factor: First Time Payee / Payee Not in Contacts
    payee_upi = transaction.get("payee_upi", "")
    known_payees = set(user_history.get("known_payees", []))
    if first_payee_toggle or (not has_telemetry and payee_upi and payee_upi not in known_payees):
        contribution = 25.0 if amount > 5000 else 15.0
        factors.append({
            "factor": "Payee Not in Contacts (Sensor Override)",
            "contribution": contribution,
            "detail": f"Payee in Contacts status was changed to False (First-time payment to unverified recipient {payee_upi})",
        })
        total_score += contribution

    # ─── Factor 4: Unusual Time ───
    current_hour = datetime.now(timezone.utc).hour
    ist_hour = (current_hour + 5.5) % 24
    if ist_hour >= 23 or ist_hour < 6:
        contribution = WEIGHTS["unusual_time"]
        factors.append({
            "factor": "Unusual transaction time",
            "contribution": contribution,
            "detail": f"Transaction at {int(ist_hour)}:00 IST — outside normal banking hours",
        })
        total_score += contribution

    # ─── Factor 5: Rapid Succession ───
    recent_count = user_history.get("recent_txn_count_5min", 0)
    if recent_count >= 3:
        contribution = WEIGHTS["rapid_succession"]
        factors.append({
            "factor": "Multiple rapid transactions",
            "contribution": contribution,
            "detail": f"{recent_count} transactions in the last 5 minutes",
        })
        total_score += contribution

    risk_score = min(100.0, max(0.0, total_score))

    if risk_score < 30:
        risk_level = "low"
    elif risk_score < 60:
        risk_level = "medium"
    elif risk_score < 80:
        risk_level = "high"
    else:
        risk_level = "critical"

    explanation = _generate_explanation(risk_level, risk_score, factors, amount, payee_upi)
    recommendation = _generate_recommendation(risk_level, factors)

    return {
        "risk_score": round(risk_score, 1),
        "risk_level": risk_level,
        "explanation": explanation,
        "factors": factors,
        "recommendation": recommendation,
        "model_type": "rule_based"
    }


def _explain_prediction(
    transaction: Dict[str, Any],
    user_history: Dict[str, Any],
    risk_score: float,
) -> List[Dict[str, Any]]:
    """
    Explain ONNX model predictions by identifying which trigger rules match the context,
    normalizing their contributions to sum up to the model score.
    """
    matched_factors = []
    
    avg_amount = user_history.get("avg_amount", 0)
    amount = transaction.get("amount", 0)
    
    if avg_amount > 0 and amount > avg_amount * 3:
        matched_factors.append({
            "factor": "Unusually large amount",
            "base_weight": WEIGHTS["large_amount"],
            "detail": f"₹{amount:,.0f} is {round(amount/avg_amount, 1)}x your average"
        })

    telemetry = transaction.get("telemetry") or {}
    has_telemetry = bool(telemetry)

    if telemetry.get("activeCall") or telemetry.get("call_state_active"):
        matched_factors.append({
            "factor": "Call State Active (Sensor Override)",
            "base_weight": 35.0,
            "detail": "Call State Active was changed from False to True (Active call detected during payment)"
        })
    if telemetry.get("newDevice") or (telemetry.get("device_fingerprint_match") is True) or (not has_telemetry and transaction.get("device_fingerprint") != user_history.get("registered_device")):
        matched_factors.append({
            "factor": "Unrecognized / New Device (Sensor Override)",
            "base_weight": 25.0,
            "detail": "Device status was changed to New Device"
        })
    if telemetry.get("firstTimePayee") or (telemetry.get("payee_in_contacts") is False) or (not has_telemetry and transaction.get("payee_upi") not in user_history.get("known_payees", [])):
        matched_factors.append({
            "factor": "Payee Not in Contacts (Sensor Override)",
            "base_weight": 20.0,
            "detail": f"Payee in Contacts status was changed to False (First payment to {transaction.get('payee_upi', '')})"
        })
    
    payee_upi = transaction.get("payee_upi", "")
    current_hour = datetime.now(timezone.utc).hour
    ist_hour = (current_hour + 5.5) % 24
    if ist_hour >= 23 or ist_hour < 6:
        matched_factors.append({
            "factor": "Unusual transaction time",
            "base_weight": WEIGHTS["unusual_time"],
            "detail": f"Transaction outside normal hours"
        })
        
    recent_count = user_history.get("recent_txn_count_5min", 0)
    if recent_count >= 2:
        weight = WEIGHTS["rapid_succession"] if recent_count >= 3 else WEIGHTS["rapid_succession"] * 0.5
        matched_factors.append({
            "factor": "Rapid succession payments",
            "base_weight": weight,
            "detail": f"{recent_count} transactions in the last 5 minutes"
        })
        
    # Scale feature attribution to match risk_score
    total_base = sum(f["base_weight"] for f in matched_factors)
    if total_base == 0:
        total_base = 1
        
    explained_factors = []
    for f in matched_factors:
        contribution = (f["base_weight"] / total_base) * risk_score
        explained_factors.append({
            "factor": f["factor"],
            "contribution": round(contribution, 1),
            "detail": f["detail"]
        })
        
    return explained_factors


def _generate_explanation(
    risk_level: str,
    risk_score: float,
    factors: List[Dict],
    amount: float,
    payee_upi: str,
) -> str:
    """Generate a human-readable explanation of the risk assessment."""
    if not factors:
        return "This transaction appears to be within your normal payment patterns. No risk factors detected."

    sensor_overrides = [f["factor"] for f in factors if "Sensor Override" in f.get("factor", "")]
    other_factors = [f["factor"] for f in factors if "Sensor Override" not in f.get("factor", "")]

    reasons = []
    if sensor_overrides:
        reasons.append(f"Situational sensor changes detected ({', '.join(sensor_overrides)})")
    if other_factors:
        reasons.append(f"Risk indicators ({', '.join(other_factors)})")

    reason_str = " & ".join(reasons)

    if risk_level == "low":
        return f"Payment of ₹{amount:,.0f} to {payee_upi} completed safely. Minor notes: {reason_str}."
    elif risk_level == "medium":
        return (
            f"Payment Paused: The payment of ₹{amount:,.0f} to {payee_upi} was intercepted because "
            f"situational sensor defaults were changed during payment initiation ({reason_str}). Please verify before proceeding."
        )
    elif risk_level == "high":
        return (
            f"⚠️ HIGH RISK INTERCEPT: This transaction of ₹{amount:,.0f} to {payee_upi} "
            f"was paused due to situational sensor deviations from default safe states ({reason_str})."
        )
    else:  # critical
        return (
            f"🚨 CRITICAL RISK BLOCKED: This transaction of ₹{amount:,.0f} to {payee_upi} "
            f"was blocked for security review. Multiple sensor overrides detected: {reason_str}."
        )


def _generate_recommendation(risk_level: str, factors: List[Dict]) -> str:
    """Generate actionable recommendation based on risk factors."""
    if risk_level == "low":
        return "Transaction looks safe. You may proceed."

    recommendations = []
    factor_names = {f["factor"] for f in factors}

    if "New payee" in factor_names or "First-time payee (high value)" in factor_names:
        recommendations.append("Verify you know this payee personally")
    if "Device change detected" in factor_names:
        recommendations.append("Confirm you are using your own device")
    if "Unusually large amount" in factor_names:
        recommendations.append("Double-check the payment amount")
    if "Rapid succession payments" in factor_names or "Multiple rapid transactions" in factor_names:
        recommendations.append("Wait a few minutes before making another transaction")
    if "Unusual transaction time" in factor_names:
        recommendations.append("Consider making this payment during banking hours")

    if not recommendations:
        recommendations.append("Please review the transaction details carefully before proceeding")

    return ". ".join(recommendations) + "."

