from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.models.users import User, UserCreateRequest, UserResponse
from app.utils.db import get_session
import logging

router = APIRouter()

sessionDep = Annotated[Session, Depends(get_session)]
logger = logging.getLogger(__name__)


@router.get("/me", response_model=UserResponse)
async def get_me(request: Request, session: sessionDep):
    """Return the currently authenticated user's public details.

    Requires JWT via middleware which sets request.state.user_email.
    """
    user_email = getattr(request.state, "user_email", None)
    if not user_email:
        # Should be prevented by middleware, but keep a safe guard
        logger.warning("Unauthorized access attempt to /api/users/me without user_email in state")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user: User | None = session.query(User).filter(User.email == user_email).first()
    if not user:
        logger.warning("Authenticated email not found in DB while accessing /api/users/me: %s", user_email)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    logger.info("/api/users/me accessed by %s", user_email)
    return UserResponse(id=user.id, email=user.email, name=user.name)
