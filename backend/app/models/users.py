from sqlmodel import Field, SQLModel, Relationship
from pydantic import EmailStr, field_validator
from typing import Optional, List, TYPE_CHECKING
import re

if TYPE_CHECKING:
    from .refresh_tokens import RefreshToken
    from .reset_codes import ResetCode

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=50)
    name: str = Field(max_length=100)


class User(UserBase, table=True):
    __tablename__ = "users"
    id: int = Field(primary_key=True, index=True)
    password: str
    
    # Relationship to RefreshTokens
    refresh_tokens: List["RefreshToken"] = Relationship(back_populates="user")
    
    # Relationship to ResetCodes
    reset_codes: List["ResetCode"] = Relationship(back_populates="user")


class UserCreateRequest(UserBase):
    password: str
    

class UserLoginRequest(SQLModel):
    email: EmailStr
    password: str


class UserResponse(SQLModel):
    id: int
    email: EmailStr
    name: str


class UserTokenResponse(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
