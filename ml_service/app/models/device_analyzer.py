"""
Device Analyzer — detects device fingerprint changes and anomalies.
"""

from typing import Dict, Any, List, Optional


def analyze_device(
    current_fingerprint: Optional[str],
    registered_fingerprint: Optional[str],
    known_devices: List[str] = None,
) -> Dict[str, Any]:
    """
    Analyze device fingerprint for changes.

    Returns:
        device_changed: bool — whether the device is different from registered
        risk_contribution: float — risk score contribution (0-25)
        detail: str — human-readable explanation
    """
    if not current_fingerprint or not registered_fingerprint:
        return {
            "device_changed": False,
            "risk_contribution": 0,
            "detail": "Device fingerprint not available for comparison",
        }

    known = set(known_devices or [])

    if current_fingerprint == registered_fingerprint:
        return {
            "device_changed": False,
            "risk_contribution": 0,
            "detail": "Transaction from registered device",
        }

    if current_fingerprint in known:
        return {
            "device_changed": True,
            "risk_contribution": 10,
            "detail": "Transaction from a known but non-primary device",
        }

    return {
        "device_changed": True,
        "risk_contribution": 25,
        "detail": "Transaction from an unrecognized device",
    }
