"""
Auth router — handles user registration, login, token refresh, and current user info.
"""

from fastapi import APIRouter, Depends

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleLoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
)
from app.services.auth_service import register_user, login_user, google_login_user, refresh_access_token
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=201)
async def register(request: RegisterRequest):
    """
    Register a new user account.
    Returns the created user info (no password).
    """
    user = await register_user(
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        phone=request.phone,
        upi_id=request.upi_id,
    )

    return {
        "success": True,
        "message": "Account created successfully",
        "data": {
            "user_id": user["_id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
        }
    }


@router.post("/login", response_model=dict)
async def login(request: LoginRequest):
    """
    Authenticate user and return JWT tokens.
    The response includes the user's role so the frontend knows which dashboard to show.
    """
    tokens = await login_user(email=request.email, password=request.password)

    return {
        "success": True,
        "message": "Login successful",
        "data": tokens,
    }


@router.post("/google", response_model=dict)
async def google_auth(request: GoogleLoginRequest):
    """
    Authenticate or register user via Google OAuth 2.0.
    Accepts Google ID Token (credential) and returns standard RakshaPay JWT access and refresh tokens.
    """
    tokens = await google_login_user(request.credential)

    return {
        "success": True,
        "message": "Google authentication successful",
        "data": tokens,
    }


@router.post("/refresh", response_model=dict)
async def refresh_token(request: RefreshTokenRequest):
    """Generate a new access token from a valid refresh token."""
    tokens = await refresh_access_token(request.refresh_token)

    return {
        "success": True,
        "message": "Token refreshed",
        "data": tokens,
    }


@router.get("/me", response_model=dict)
async def get_me(user: dict = Depends(get_current_user)):
    """Get the current authenticated user's info."""
    return {
        "success": True,
        "data": {
            "id": user["_id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "phone": user.get("phone"),
            "role": user["role"],
            "upi_id": user.get("upi_id"),
            "is_active": user.get("is_active", True),
            "balance": user.get("balance", 0.0),
            "created_at": user["created_at"].isoformat(),
        }
    }
