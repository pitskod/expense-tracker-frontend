import os
from functools import lru_cache


class DatabaseConfig:
    """Database configuration from environment variables"""

    def __init__(self):
        self.host: str = os.getenv("DB_HOST", "localhost")
        self.port: int = int(os.getenv("DB_PORT", "5432"))
        self.name: str = os.getenv("DB_NAME", "postgres")  # Default matches docker-compose
        self.user: str = os.getenv("DB_USER", "postgres")
        self.password: str = os.getenv("DB_PASSWORD", "passw0rd")

    @property
    def database_url(self) -> str:
        """Generate PostgreSQL database URL"""
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    @property
    def async_database_url(self) -> str:
        """Generate async PostgreSQL database URL"""
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"


class AppConfig:
    """Application configuration from environment variables"""

    def __init__(self):
        self.environment: str = os.getenv("APP_ENV", "development")
        self.debug: bool = os.getenv("DEBUG", "True").lower() == "true"
        self.secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

        # JWT Configuration
        self.jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", self.secret_key)
        self.jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

        self.database: DatabaseConfig = DatabaseConfig()

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache()
def get_app_config() -> AppConfig:
    """Get application configuration (cached)"""
    return AppConfig()


app_config = get_app_config()
