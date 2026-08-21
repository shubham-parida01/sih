"""
Authentication middleware — JWT verification and role-based access control.
Provides FastAPI dependencies for protecting routes.
"""

from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from app.database import get_database
from app.utils.security import decode_token
from app.utils.exceptions import CredentialsException, ForbiddenException

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Extract and validate JWT token from Authorization header.
    Returns the full user document from MongoDB.

    Usage:
        @router.get("/protected")
        async def protected_route(user: dict = Depends(get_current_user)):
            ...
    """
    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise CredentialsException("Invalid or expired token")

    # Check token type
    if payload.get("type") != "access":
        raise CredentialsException("Invalid token type. Use an access token.")

    user_id = payload.get("sub")
    if user_id is None:
        raise CredentialsException("Token missing user identifier")

    # Fetch user from database
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if user is None:
        raise CredentialsException("User not found")

    if not user.get("is_active", False):
        raise ForbiddenException("Account is deactivated")

    # Convert ObjectId to string for convenience
    user["_id"] = str(user["_id"])
    return user


async def require_admin(
    user: dict = Depends(get_current_user),
) -> dict:
    """
    Dependency that ensures the current user has admin role.

    Usage:
        @router.get("/admin-only")
        async def admin_route(admin: dict = Depends(require_admin)):
            ...
    """
    if user.get("role") != "admin":
        raise ForbiddenException("Admin access required")
    return user


async def require_user(
    user: dict = Depends(get_current_user),
) -> dict:
    """
    Dependency that ensures the current user has regular user role.

    Usage:
        @router.get("/user-only")
        async def user_route(user: dict = Depends(require_user)):
            ...
    """
    if user.get("role") != "user":
        raise ForbiddenException("User access required")
    return user


def get_client_ip(request: Request) -> str:
    """Extract client IP address from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
