"""
Backend configuration module.
Loads all settings from environment variables with Pydantic BaseSettings.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    # MongoDB Atlas
    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017",
        description="MongoDB Atlas connection string"
    )
    DATABASE_NAME: str = Field(
        default="sih2026",
        description="MongoDB database name"
    )

    # JWT Configuration
    JWT_SECRET: str = Field(
        default="dev-secret-key-change-in-production",
        description="Secret key for JWT token signing"
    )
    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="JWT signing algorithm"
    )
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
        description="Access token expiry in minutes"
    )
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7,
        description="Refresh token expiry in days"
    )

    # Admin Account (seeded on first startup)
    ADMIN_EMAIL: str = Field(
        default="admin@sih2026.com",
        description="Admin email for seeding"
    )
    ADMIN_PASSWORD: str = Field(
        default="AdminSecurePass123!",
        description="Admin password for seeding"
    )
    ADMIN_FULL_NAME: str = Field(
        default="System Administrator",
        description="Admin display name"
    )

    # ML Microservice
    ML_SERVICE_URL: str = Field(
        default="http://localhost:8001",
        description="URL of the ML risk scoring microservice"
    )

    # CORS
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        description="Comma-separated CORS allowed origins"
    )

    # Webhook
    WEBHOOK_SECRET: str = Field(
        ...,
        description="Secret for webhook signature verification"
    )

    # Server
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Singleton settings instance
settings = Settings()
