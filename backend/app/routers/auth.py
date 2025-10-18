from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.models.users import UserCreateRequest, UserLoginRequest, UserTokenResponse, UserResponse
from app.utils.db import get_session
from app.utils.auth import (
    authenticate_user, 
    create_user_tokens, 
    get_user_by_email, 
    create_user
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("/sign-up", response_model=UserTokenResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(user_data: UserCreateRequest, session: SessionDep):
    """Register a new user and return access and refresh tokens."""
    try:
        existing_user = get_user_by_email(session, user_data.email)
        if existing_user:
            logger.warning(f"Sign-up attempt with existing email: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        user = create_user(
            session=session,
            email=user_data.email,
            name=user_data.name,
            password=user_data.password
        )
        
        tokens = create_user_tokens(session, user)
        
        logger.info(f"Successful sign-up for user: {user.email}")
        
        return UserTokenResponse(**tokens)
        
    except ValueError as e:
        logger.warning(f"Invalid sign-up data for {user_data.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Sign-up error for {user_data.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during registration"
        )


@router.post("/sign-in", response_model=UserTokenResponse)
async def sign_in(user_data: UserLoginRequest, session: SessionDep):
    """Authenticate user and return access and refresh tokens."""
    try:
        user = authenticate_user(session, user_data.email, user_data.password)
        if not user:
            logger.warning(f"Failed login attempt for email: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        tokens = create_user_tokens(session, user)
        
        logger.info(f"Successful sign-in for user: {user.email}")
        
        return UserTokenResponse(**tokens)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Sign-in error for {user_data.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication"
        )