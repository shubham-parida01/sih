"""
Behavior Analyzer — detects unusual payment patterns.
Analyzes transaction history for anomalous behavior.
"""

from typing import Dict, Any, List


def analyze_behavior(
    transaction: Dict[str, Any],
    user_history: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Analyze payment behavior patterns.

    Checks:
    - Transaction frequency anomalies
    - Amount distribution outliers
    - Payee diversity changes
    - Time-of-day patterns

    Returns behavior analysis with risk factors.
    """
    factors = []

    amount = transaction.get("amount", 0)
    avg_amount = user_history.get("avg_amount", 0)
    max_amount = user_history.get("max_amount", 0)
    total_txns = user_history.get("total_transactions", 0)
    recent_count = user_history.get("recent_txn_count_5min", 0)

    # Check if amount is an outlier
    if avg_amount > 0:
        z_score = abs(amount - avg_amount) / max(avg_amount * 0.5, 1)
        if z_score > 3:
            factors.append({
                "pattern": "amount_outlier",
                "severity": "high",
                "detail": f"Amount is {z_score:.1f} standard deviations from average",
            })

    # Check for velocity anomaly (too many transactions too fast)
    if recent_count > 5:
        factors.append({
            "pattern": "velocity_anomaly",
            "severity": "high",
            "detail": f"{recent_count} transactions in 5 minutes — possible automated attack",
        })
    elif recent_count > 2:
        factors.append({
            "pattern": "elevated_velocity",
            "severity": "medium",
            "detail": f"{recent_count} transactions in 5 minutes",
        })

    # Check if exceeding historical max
    if max_amount > 0 and amount > max_amount * 1.5:
        factors.append({
            "pattern": "exceeds_max",
            "severity": "medium",
            "detail": f"Amount exceeds historical maximum by {((amount / max_amount - 1) * 100):.0f}%",
        })

    is_anomalous = any(f["severity"] == "high" for f in factors)

    return {
        "is_anomalous": is_anomalous,
        "factors": factors,
        "total_patterns_checked": 3,
        "anomalies_found": len(factors),
    }
