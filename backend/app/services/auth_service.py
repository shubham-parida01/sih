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
    initial_balance: Optional[float] = None,
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
    if len(password.encode("utf-8")) > 72:
        from app.utils.exceptions import BadRequestException
        raise BadRequestException("Password is too long (bcrypt supports max 72 bytes)")
    hashed = hash_password(password)
    user_doc = create_user_document(
        email=email,
        full_name=full_name,
        hashed_password=hashed,
        role=UserRole.USER,
        phone=phone,
        upi_id=upi_id,
        initial_balance=initial_balance,
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


async def verify_google_token(credential: str) -> dict:
    """
    Verify Google ID Token using google-auth or fallback to Google tokeninfo endpoint.
    """
    id_info = None

    # Method 1: Try local google-auth verification
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        id_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
    except Exception as local_err:
        print(f"[*] Local Google ID token verification info: {local_err}. Falling back to tokeninfo API...")

    # Method 2: Verify via Google's tokeninfo endpoint with httpx
    if not id_info:
        try:
            import httpx
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    "https://oauth2.googleapis.com/tokeninfo",
                    params={"id_token": credential}
                )
                if res.status_code == 200:
                    token_data = res.json()
                    # Verify audience / client ID
                    if settings.GOOGLE_CLIENT_ID and token_data.get("aud") != settings.GOOGLE_CLIENT_ID:
                        # If client ID is configured and doesn't match
                        raise CredentialsException("Invalid Google Client ID audience")
                    id_info = token_data
                else:
                    raise CredentialsException("Google token verification failed")
        except CredentialsException:
            raise
        except Exception as api_err:
            raise CredentialsException(f"Failed to verify Google token: {str(api_err)}")

    if not id_info or not id_info.get("email"):
        raise CredentialsException("Invalid Google token payload: email missing")

    return id_info


async def google_login_user(credential: str) -> dict:
    """
    Authenticate user via Google OAuth 2.0.
    If the user does not exist, an account is automatically created.
    """
    import secrets
    id_info = await verify_google_token(credential)

    email = id_info.get("email").lower().strip()
    full_name = id_info.get("name") or id_info.get("given_name") or email.split("@")[0]
    avatar_url = id_info.get("picture")

    db = get_database()
    user = await db.users.find_one({"email": email})

    if user:
        if not user.get("is_active", False):
            raise CredentialsException("Account is deactivated")
        
        # Update avatar if user doesn't have one
        if avatar_url and not user.get("profile", {}).get("avatar_url"):
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"profile.avatar_url": avatar_url, "updated_at": datetime.now(timezone.utc)}}
            )
    else:
        # Auto-create user
        clean_prefix = "".join(c for c in email.split("@")[0] if c.isalnum() or c in "._")
        suggested_upi = f"{clean_prefix}@upi"
        
        # Ensure unique UPI ID
        existing_upi = await db.users.find_one({"upi_id": suggested_upi})
        if existing_upi:
            suggested_upi = f"{clean_prefix}{secrets.randbelow(1000)}@upi"

        random_password = secrets.token_urlsafe(32)
        hashed = hash_password(random_password[:72])

        user_doc = create_user_document(
            email=email,
            full_name=full_name,
            hashed_password=hashed,
            role=UserRole.USER,
            upi_id=suggested_upi,
            initial_balance=50000.0,
        )
        if avatar_url:
            user_doc["profile"]["avatar_url"] = avatar_url

        result = await db.users.insert_one(user_doc)
        user = user_doc
        user["_id"] = result.inserted_id

    # Generate JWT tokens
    user_id = str(user["_id"])
    token_data = {
        "sub": user_id,
        "email": user["email"],
        "role": user.get("role", "user"),
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.get("role", "user"),
        "user_id": user_id,
        "full_name": user.get("full_name", full_name),
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

    if len(settings.ADMIN_PASSWORD.encode("utf-8")) > MAX_BCRYPT_PASSWORD_BYTES:
        raise BadRequestException("Admin password must be at most 72 bytes long")

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
