from datetime import datetime, timezone
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional


class RefreshTokenBase(SQLModel):
    token: str = Field(unique=True, index=True, max_length=500)
    expires_at: datetime
    user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RefreshToken(RefreshTokenBase, table=True):
    __tablename__ = "refresh_tokens"
    id: int = Field(primary_key=True, index=True)
    
    # Relationship to User
    user: Optional["User"] = Relationship(back_populates="refresh_tokens")


class RefreshTokenCreate(SQLModel):
    token: str
    expires_at: datetime
    user_id: int


class RefreshTokenResponse(RefreshTokenBase):
    id: int


class TokenRefreshRequest(SQLModel):
    refresh_token: str