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

    # ─── Factor 1: Large Amount ───
    avg_amount = user_history.get("avg_amount", 0)
    amount = transaction.get("amount", 0)

    if avg_amount > 0 and amount > avg_amount * 3:
        multiplier = round(amount / avg_amount, 1)
        contribution = min(WEIGHTS["large_amount"], WEIGHTS["large_amount"] * (multiplier / 5))
        factors.append({
            "factor": "Unusually large amount",
            "contribution": round(contribution, 1),
            "detail": f"₹{amount:,.0f} is {multiplier}x your average transaction of ₹{avg_amount:,.0f}",
        })
        total_score += contribution
    elif avg_amount == 0 and amount > 10000:
        factors.append({
            "factor": "Large first transaction",
            "contribution": 12,
            "detail": f"₹{amount:,.0f} is a significant amount for a new account",
        })
        total_score += 12

    # ─── Factor 2: New Payee ───
    known_payees = set(user_history.get("known_payees", []))
    payee_upi = transaction.get("payee_upi", "")

    if payee_upi and payee_upi not in known_payees:
        contribution = WEIGHTS["new_payee"]
        if amount > 5000:
            contribution = WEIGHTS["high_value_new_payee"]
            factors.append({
                "factor": "First-time payee (high value)",
                "contribution": contribution,
                "detail": f"First transaction to {payee_upi} with amount ₹{amount:,.0f}",
            })
        else:
            factors.append({
                "factor": "New payee",
                "contribution": contribution,
                "detail": f"You haven't transacted with {payee_upi} before",
            })
        total_score += contribution

    # ─── Factor 3: Device Change ───
    current_device = transaction.get("device_fingerprint")
    registered_device = transaction.get("user_registered_device") or user_history.get("registered_device")
    known_devices = set(user_history.get("known_devices", []))

    if current_device and registered_device and current_device != registered_device:
        if current_device not in known_devices:
            contribution = WEIGHTS["device_change"]
            factors.append({
                "factor": "Device change detected",
                "contribution": contribution,
                "detail": "Transaction from an unrecognized device",
            })
            total_score += contribution
        else:
            contribution = WEIGHTS["device_change"] * 0.4
            factors.append({
                "factor": "Different device",
                "contribution": round(contribution, 1),
                "detail": "Transaction from a previously used but non-primary device",
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
    elif recent_count >= 2:
        contribution = WEIGHTS["rapid_succession"] * 0.5
        factors.append({
            "factor": "Quick successive transactions",
            "contribution": round(contribution, 1),
            "detail": f"{recent_count} transactions in the last 5 minutes",
        })
        total_score += contribution

    # ─── Factor 6: New Account ───
    account_age = user_history.get("account_age_days", 0)

    if account_age < 7:
        contribution = WEIGHTS["new_account"]
        factors.append({
            "factor": "New account",
            "contribution": contribution,
            "detail": f"Account created {int(account_age)} day(s) ago",
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
    
    payee_upi = transaction.get("payee_upi", "")
    known_payees = set(user_history.get("known_payees", []))
    if payee_upi and payee_upi not in known_payees:
        weight = WEIGHTS["high_value_new_payee"] if amount > 5000 else WEIGHTS["new_payee"]
        matched_factors.append({
            "factor": "New payee",
            "base_weight": weight,
            "detail": f"First transaction to {payee_upi}"
        })
        
    current_device = transaction.get("device_fingerprint")
    registered_device = transaction.get("user_registered_device") or user_history.get("registered_device")
    if current_device and registered_device and current_device != registered_device:
        matched_factors.append({
            "factor": "Device change detected",
            "base_weight": WEIGHTS["device_change"],
            "detail": "Transaction from an unrecognized device"
        })
        
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

    factor_names = [f["factor"].lower() for f in factors]

    if risk_level == "low":
        return f"This transaction of ₹{amount:,.0f} to {payee_upi} appears safe. Minor factors noted: {', '.join(factor_names)}."
    elif risk_level == "medium":
        return (
            f"This transaction was flagged for review. "
            f"The payment of ₹{amount:,.0f} to {payee_upi} triggered: "
            f"{', '.join(factor_names)}. Please verify before proceeding."
        )
    elif risk_level == "high":
        return (
            f"⚠️ HIGH RISK: This transaction of ₹{amount:,.0f} to {payee_upi} "
            f"has been flagged due to: {', '.join(factor_names)}. "
            f"We strongly recommend you verify this payment."
        )
    else:  # critical
        return (
            f"🚨 CRITICAL RISK: This transaction of ₹{amount:,.0f} to {payee_upi} "
            f"has been blocked for security review. Multiple high-risk indicators detected: "
            f"{', '.join(factor_names)}. An administrator will review this transaction."
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

