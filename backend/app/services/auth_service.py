"""
Auth service — handles user registration, login, and token management.
"""

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from app.database import get_database
from app.models.user import create_user_document, UserRole
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.utils.exceptions import (
    ConflictException,
    CredentialsException,
    NotFoundException,
    BadRequestException,
)
from app.config import settings

MAX_BCRYPT_PASSWORD_BYTES = 72


async def register_user(
    email: str,
    password: str,
    full_name: str,
    phone: Optional[str] = None,
    upi_id: Optional[str] = None,
) -> dict:
    """
    Register a new user account.
    Raises ConflictException if email already exists.
    """
    db = get_database()

    # Check if email already exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise ConflictException("An account with this email already exists")

    # Check if phone is taken (if provided)
    if phone:
        existing_phone = await db.users.find_one({"phone": phone})
        if existing_phone:
            raise ConflictException("An account with this phone number already exists")

    # Check if UPI ID is taken (if provided)
    if upi_id:
        existing_upi = await db.users.find_one({"upi_id": upi_id})
        if existing_upi:
            raise ConflictException("This UPI ID is already registered")

    if len(password.encode("utf-8")) > MAX_BCRYPT_PASSWORD_BYTES:
        raise BadRequestException("Password must be at most 72 bytes long")

    # Create user document
    hashed = hash_password(password)
    user_doc = create_user_document(
        email=email,
        full_name=full_name,
        hashed_password=hashed,
        role=UserRole.USER,
        phone=phone,
        upi_id=upi_id,
    )

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)

    return user_doc


async def login_user(email: str, password: str) -> dict:
    """
    Authenticate user and return JWT tokens.
    Raises CredentialsException if credentials are invalid.
    """
    db = get_database()

    user = await db.users.find_one({"email": email})
    if not user:
        raise CredentialsException("Invalid email or password")

    if not verify_password(password, user["hashed_password"]):
        raise CredentialsException("Invalid email or password")

    if not user.get("is_active", False):
        raise CredentialsException("Account is deactivated")

    # Create tokens
    user_id = str(user["_id"])
    token_data = {
        "sub": user_id,
        "email": user["email"],
        "role": user["role"],
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user["role"],
        "user_id": user_id,
        "full_name": user["full_name"],
    }


async def refresh_access_token(refresh_token: str) -> dict:
    """
    Generate a new access token from a valid refresh token.
    """
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise CredentialsException("Invalid refresh token")

    user_id = payload.get("sub")
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise CredentialsException("User not found")

    token_data = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
    }

    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "role": user["role"],
        "user_id": str(user["_id"]),
        "full_name": user["full_name"],
    }


async def seed_admin():
    """
    Seed the admin account on first startup if it doesn't exist.
    Called from the app startup event.
    """
    db = get_database()

    existing_admin = await db.users.find_one({"role": "admin"})
    if existing_admin:
        print(f"[OK] Admin account already exists: {existing_admin['email']}")
        return

    hashed = hash_password(settings.ADMIN_PASSWORD)
    admin_doc = create_user_document(
        email=settings.ADMIN_EMAIL,
        full_name=settings.ADMIN_FULL_NAME,
        hashed_password=hashed,
        role=UserRole.ADMIN,
    )
    # Admin gets a high balance for demo purposes
    admin_doc["balance"] = 0.0

    await db.users.insert_one(admin_doc)
    print(f"[OK] Admin account seeded: {settings.ADMIN_EMAIL}")
