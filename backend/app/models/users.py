from sqlmodel import Field, SQLModel
from pydantic import EmailStr

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=50)
    name: str = Field(max_length=100)
    password: str


class User(UserBase, table=True):
    __tablename__ = "users"
    id: int = Field(primary_key=True, index=True)


class UserCreateRequest(UserBase):
    pass


class UserResponse(SQLModel):
    id: int
