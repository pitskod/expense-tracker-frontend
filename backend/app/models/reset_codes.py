from datetime import datetime, timezone, timedelta
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional


class ResetCodeBase(SQLModel):
    code: str = Field(unique=True, index=True, max_length=100)
    expires_at: datetime
    user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    used: bool = Field(default=False)


class ResetCode(ResetCodeBase, table=True):
    __tablename__ = "reset_codes"
    id: int = Field(primary_key=True, index=True)
    
    # Relationship to User
    user: Optional["User"] = Relationship(back_populates="reset_codes")


class ResetCodeCreate(SQLModel):
    code: str
    expires_at: datetime
    user_id: int


class ForgotPasswordRequest(SQLModel):
    email: str


class ResetCodeResponse(SQLModel):
    message: str