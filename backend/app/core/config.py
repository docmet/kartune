import json
from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "KarTune"
    API_V1_STR: str = "/api"

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str

    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS - can be JSON string or will use default
    CORS_ORIGINS: Union[List[str], str] = '["http://localhost:3000", "http://localhost"]'

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                # If parsing fails, return default
                return ["http://localhost:3000", "http://localhost"]
        return v

    # Uploads
    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings(_env_file=None)  # type: ignore[call-arg]
