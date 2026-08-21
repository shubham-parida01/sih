"""
Voice Phishing Detector — STUB module.

This is a placeholder for the voice phishing detection capability.
When the ML team has an audio classification model ready, this module
should be updated to:
1. Accept audio features or transcription text
2. Run inference on a trained model (e.g., NLP on call transcripts)
3. Return phishing probability and indicators

Indicators to look for:
- Coercive language patterns ("urgent", "immediately", "your account will be blocked")
- Social engineering phrases ("I'm calling from your bank", "verify your PIN")
- Emotional manipulation ("don't tell anyone", "this is confidential")
"""

from typing import Dict, Any, Optional


def detect_voice_phishing(
    audio_features: Optional[Dict[str, Any]] = None,
    transcript: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Analyze audio/transcript for voice phishing indicators.

    STUB — Returns safe result until ML model is integrated.

    Args:
        audio_features: Optional audio analysis features
        transcript: Optional call transcript text

    Returns:
        Voice phishing analysis result.
    """
    # When transcript is provided, do basic keyword matching
    if transcript:
        phishing_keywords = [
            "urgent", "immediately", "verify your pin",
            "your account will be blocked", "don't tell anyone",
            "this is confidential", "transfer now",
            "otp", "share your password", "calling from bank",
        ]

        found_indicators = []
        transcript_lower = transcript.lower()

        for keyword in phishing_keywords:
            if keyword in transcript_lower:
                found_indicators.append(keyword)

        if found_indicators:
            return {
                "is_phishing": True,
                "confidence": min(0.5 + len(found_indicators) * 0.1, 0.95),
                "indicators": found_indicators,
                "recommendation": "This conversation contains potential social engineering patterns. Do not share sensitive information.",
            }

    return {
        "is_phishing": False,
        "confidence": 0.1,
        "indicators": [],
        "recommendation": "No voice phishing indicators detected.",
    }
