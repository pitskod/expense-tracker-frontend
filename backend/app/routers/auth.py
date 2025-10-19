from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.models.users import UserCreateRequest, UserLoginRequest, UserTokenResponse, UserResponse, User
from app.models.refresh_tokens import TokenRefreshRequest, RefreshToken
from app.models.reset_codes import ForgotPasswordRequest, ResetCodeResponse
from app.utils.db import get_session
from app.utils.auth import (
    authenticate_user, 
    create_user_tokens, 
    get_user_by_email, 
    create_user
)
from app.utils.reset_codes import (
    create_reset_code,
    get_user_by_email as get_user_by_email_reset,
    generate_reset_link
)
from app.utils.email import email_service
from app.config.config import app_config
from datetime import datetime, timezone
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
    
    except HTTPException:
        raise
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

@router.post("/token", response_model=UserTokenResponse)
async def refresh_access_token(payload: TokenRefreshRequest, session: SessionDep):
    """Validate refresh token and issue a new access and refresh token pair."""
    token_value = payload.refresh_token

    try:
        # Look up token (ideally hashed)
        db_token: RefreshToken | None = (
            session.query(RefreshToken)
            .filter(RefreshToken.token == token_value)
            .first()
        )
        if not db_token:
            logger.warning("Invalid refresh token used")
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        # Expiry check
        expires_at = db_token.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= datetime.now(timezone.utc):
            logger.info("Expired refresh token for user_id=%s", db_token.user_id)
            # Clean up expired token
            session.delete(db_token)
            session.commit()
            raise HTTPException(status_code=401, detail="Expired refresh token")

        # Validate user
        user = session.get(User, db_token.user_id)
        if not user:
            logger.warning("Refresh token for unknown user_id=%s", db_token.user_id)
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        # Rotate token - delete old and create new
        session.delete(db_token)
        tokens = create_user_tokens(session, user)
        session.commit()

        logger.info("Refreshed tokens for user_id=%s", user.id)
        return UserTokenResponse(**tokens)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error during token refresh")
        raise HTTPException(status_code=500, detail="Internal server error during token refresh")


@router.post("/forgot-password", response_model=ResetCodeResponse)
async def forgot_password(request: ForgotPasswordRequest, session: SessionDep):
    """Send a password reset code via email."""
    try:
        # Find user by email
        user = get_user_by_email_reset(session, request.email)
        response = ResetCodeResponse(message="If your email is registered, you will receive a reset code.")
        if not user:
            # For security, don't reveal if email exists or not
            logger.warning(f"Password reset requested for non-existent email: {request.email}")
            return response

        # Generate reset code
        reset_code = create_reset_code(session, user.id)
        
        # Generate reset link for frontend
        reset_link = generate_reset_link(reset_code)
        
        # Send email
        email_sent = await email_service.send_password_reset_email(
            to_email=user.email,
            reset_code=reset_code,
            reset_link=reset_link,
            user_name=user.name
        )
        
        if not email_sent:
            logger.error(f"Email service failed, but reset code created for {user.email}")
            # In development, we'll still return success even if email fails
            # In production, you might want to handle this differently
        else:
            logger.info(f"Password reset email sent to {user.email}")
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Forgot password error for {request.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during password reset request"
        )


@router.get("/dev/reset-codes/{email}")
async def get_reset_codes_dev(email: str, session: SessionDep):
    """Development endpoint to get reset codes for an email (remove in production)."""
    if not app_config.is_development:
        raise HTTPException(status_code=404, detail="Not found")
    
    from app.utils.reset_codes import get_user_by_email
    from sqlmodel import select
    from app.models.reset_codes import ResetCode
    
    user = get_user_by_email(session, email)
    if not user:
        return {"codes": []}
    
    statement = select(ResetCode).where(ResetCode.user_id == user.id)
    codes = session.exec(statement).all()
    
    return {
        "codes": [
            {
                "code": code.code,
                "expires_at": code.expires_at,
                "used": code.used,
                "created_at": code.created_at
            }
            for code in codes
        ]
    }
