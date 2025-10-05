from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.models.users import User, UserCreateRequest, UserResponse
from app.utils.db import get_session

router = APIRouter(tags=["users"])

sessionDep = Annotated[Session, Depends(get_session)]


@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreateRequest, session: sessionDep):
    user = User(**user.model_dump())
    session.add(user)
    session.commit()
    session.refresh(user)
    return UserResponse(**user.model_dump())


@router.get("/")
async def list_users(session: sessionDep):
    return session.exec(select(User)).all()
