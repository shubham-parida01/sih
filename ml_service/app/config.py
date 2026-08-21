"""
ML Service configuration.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class MLSettings(BaseSettings):
    """ML microservice settings."""
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8001)
    MODEL_PATH: str = Field(default="./models/student_model.onnx")
    FEATURE_CONFIG_PATH: str = Field(default="./config/features.json")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


ml_settings = MLSettings()
