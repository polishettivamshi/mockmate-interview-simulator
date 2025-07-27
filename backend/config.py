import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./mockmate.db"
    
    # JWT
    jwt_secret: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # OpenRouter API
    openrouter_api_key: Optional[str] = None
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    default_model: str = "anthropic/claude-3-sonnet"
    
    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:8000"]
    
    # Redis (for Celery)
    redis_url: str = "redis://localhost:6379/0"
    
    # Application
    app_name: str = "MockMate API"
    app_version: str = "1.0.0"
    debug: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create settings instance
settings = Settings()

# Validate required settings
def validate_settings():
    """Validate that all required settings are present"""
    errors = []
    
    if not settings.jwt_secret or settings.jwt_secret == "your-secret-key-change-in-production":
        errors.append("JWT_SECRET must be set to a secure value")
    
    if not settings.openrouter_api_key:
        print("Warning: OPENROUTER_API_KEY not set. AI features will use mock responses.")
    
    if errors:
        raise ValueError(f"Configuration errors: {', '.join(errors)}")

# Database URL helpers
def get_database_url() -> str:
    """Get the database URL, ensuring SQLite path is absolute"""
    url = settings.database_url
    if url.startswith("sqlite:///") and not url.startswith("sqlite:////"):
        # Convert relative path to absolute
        db_path = url.replace("sqlite:///", "")
        if not os.path.isabs(db_path):
            db_path = os.path.join(os.getcwd(), db_path)
        url = f"sqlite:///{db_path}"
    return url
