"""
User router — handles user profile, dashboard, balance, and device management.
All endpoints require user authentication and are scoped to the authenticated user.
"""

from fastapi import APIRouter, Depends

from app.schemas.user import (
    ProfileUpdateRequest,
    DeviceFingerprintRequest,
)
from app.services.user_service import (
    get_user_profile,
    update_user_profile,
    get_user_dashboard,
    register_device_fingerprint,
    get_user_balance,
)
from app.middleware.auth_middleware import require_user

router = APIRouter(prefix="/api/user", tags=["User Portal"])


@router.get("/profile")
async def get_profile(user: dict = Depends(require_user)):
    """Get the authenticated user's profile."""
    profile = await get_user_profile(user["_id"])
    return {"success": True, "data": profile}


@router.put("/profile")
async def update_profile(
    request: ProfileUpdateRequest,
    user: dict = Depends(require_user),
):
    """Update the authenticated user's profile."""
    updates = request.model_dump(exclude_none=True)
    profile = await update_user_profile(user["_id"], updates)
    return {"success": True, "message": "Profile updated", "data": profile}


@router.get("/dashboard")
async def get_dashboard(user: dict = Depends(require_user)):
    """
    Get the personal home page dashboard data (Paytm-style).
    Includes balance, recent transactions, and risk summary.
    """
    dashboard = await get_user_dashboard(user["_id"])
    return {"success": True, "data": dashboard}


@router.get("/balance")
async def get_balance(user: dict = Depends(require_user)):
    """Get the user's current bank account balance."""
    balance = await get_user_balance(user["_id"])
    return {"success": True, "data": balance}


@router.post("/device")
async def register_device(
    request: DeviceFingerprintRequest,
    user: dict = Depends(require_user),
):
    """
    Register or update the user's device fingerprint.
    Used for device change detection in risk scoring.
    """
    result = await register_device_fingerprint(
        user_id=user["_id"],
        fingerprint_hash=request.fingerprint_hash,
        device_name=request.device_name,
        device_os=request.device_os,
        app_version=request.app_version,
    )
    return {"success": True, "message": "Device registered", "data": result}
