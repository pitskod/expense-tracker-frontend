from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlmodel import Session
from app.models.users import UserCreateRequest, UserLoginRequest, UserTokenResponse, UserResponse, User
from app.models.refresh_tokens import RefreshToken, LogoutResponse
from app.models.reset_codes import ForgotPasswordRequest, ResetCodeResponse, RestorePasswordRequest, RestorePasswordResponse
from app.utils.db import get_session
from app.utils.auth import (
    authenticate_user, 
    create_user_tokens, 
    get_user_by_email, 
    create_user,
    update_user_password,
    logout_user,
    logout_user_all_devices,
    set_refresh_token_cookie,
    clear_refresh_token_cookie
)
from app.utils.reset_codes import (
    create_reset_code,
    get_user_by_email as get_user_by_email_reset,
    generate_reset_link,
    validate_reset_code,
    mark_reset_code_as_used
)
from app.utils.email import email_service
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("/sign-up", response_model=UserTokenResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(user_data: UserCreateRequest, session: SessionDep, response: Response):
    """Register a new user and return access token with refresh token in HTTP-only cookie."""
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
        
        # Set refresh token as HTTP-only cookie
        set_refresh_token_cookie(response, tokens["refresh_token"])
        
        logger.info(f"Successful sign-up for user: {user.email}")
        
        return UserTokenResponse(
            access_token=tokens["access_token"],
            token_type=tokens["token_type"]
        )
    
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
async def sign_in(user_data: UserLoginRequest, session: SessionDep, response: Response):
    """Authenticate user and return access token with refresh token in HTTP-only cookie."""
    try:
        user = authenticate_user(session, user_data.email, user_data.password)
        if not user:
            logger.warning(f"Failed login attempt for email: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        tokens = create_user_tokens(session, user)
        
        # Set refresh token as HTTP-only cookie
        set_refresh_token_cookie(response, tokens["refresh_token"])
        
        logger.info(f"Successful sign-in for user: {user.email}")
        
        return UserTokenResponse(
            access_token=tokens["access_token"],
            token_type=tokens["token_type"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Sign-in error for {user_data.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication"
        )

@router.post("/token", response_model=UserTokenResponse)
async def refresh_access_token(request: Request, session: SessionDep, response: Response):
    """Validate refresh token from cookie and issue new access and refresh token pair."""
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        logger.warning("Token refresh attempt without refresh token cookie")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )

    try:
        # Look up token (ideally hashed)
        db_token: RefreshToken | None = (
            session.query(RefreshToken)
            .filter(RefreshToken.token == refresh_token)
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
            # Clear the expired cookie
            clear_refresh_token_cookie(response)
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

        # Set new refresh token as HTTP-only cookie
        set_refresh_token_cookie(response, tokens["refresh_token"])

        logger.info("Refreshed tokens for user_id=%s", user.id)
        return UserTokenResponse(
            access_token=tokens["access_token"],
            token_type=tokens["token_type"]
        )

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
            logger.error(f"Failed to send reset email to {user.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send reset email"
            )
        
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


@router.post("/restore-password", response_model=RestorePasswordResponse)
async def restore_password(request: RestorePasswordRequest, session: SessionDep):
    """Validate reset code and update user's password."""
    try:
        logger.info(f"Password restore attempt with reset code: {request.reset_code[:3]}...")
        
        # Validate the reset code
        reset_code_obj = validate_reset_code(session, request.reset_code)
        if not reset_code_obj:
            logger.warning(f"Invalid or expired reset code used: {request.reset_code[:3]}...")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset code"
            )
        
        # Get the user associated with the reset code
        user = session.get(User, reset_code_obj.user_id)
        if not user:
            logger.error(f"User not found for reset code: {request.reset_code[:3]}...")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update the user's password
        password_updated = update_user_password(session, user, request.new_password)
        if not password_updated:
            logger.error(f"Failed to update password for user: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password"
            )
        
        # Mark the reset code as used and remove it
        mark_reset_code_as_used(session, reset_code_obj)
        session.delete(reset_code_obj)
        session.commit()
        
        logger.info(f"Password successfully reset for user: {user.email}")
        
        return RestorePasswordResponse(message="Password has been successfully reset")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password restore error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during password reset"
        )


@router.get("/logout", response_model=LogoutResponse)
async def logout(request: Request, session: SessionDep, response: Response):
    """Logout user from current device by invalidating the refresh token from cookie."""
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        logger.warning("Logout attempt without refresh token cookie")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No refresh token found"
        )
        
    try:
        logger.info("Logout attempt for current device")
        
        # Invalidate the specific refresh token
        success = logout_user(session, refresh_token)
        
        # Clear the refresh token cookie regardless of success
        clear_refresh_token_cookie(response)
        
        if not success:
            logger.warning("Logout failed: Invalid refresh token")
            # Still return success to prevent token enumeration
        
        return LogoutResponse(message="Successfully logged out from current device")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        # Clear cookie even on error
        clear_refresh_token_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during logout"
        )


@router.get("/logoutAll", response_model=LogoutResponse)
async def logout_all(request: Request, session: SessionDep, response: Response):
    """Logout user from all devices by invalidating all refresh tokens."""
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        logger.warning("Logout all attempt without refresh token cookie")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No refresh token found"
        )
        
    try:
        logger.info("Logout all devices attempt")
        
        # First, verify the refresh token to get the user
        db_token = session.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
        
        # Clear the refresh token cookie regardless of what happens next
        clear_refresh_token_cookie(response)
        
        if not db_token:
            logger.warning("Logout all failed: Invalid refresh token")
            # Still return success to prevent token enumeration
            return LogoutResponse(message="Successfully logged out from all devices")
        
        # Get user associated with the token
        user = session.get(User, db_token.user_id)
        if not user:
            logger.warning("Logout all failed: User not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Logout from all devices
        tokens_invalidated = logout_user_all_devices(session, user.email)
        
        if tokens_invalidated == 0:
            logger.warning(f"No tokens found to invalidate for user: {user.email}")
        
        return LogoutResponse(message=f"Successfully logged out from all devices ({tokens_invalidated} sessions ended)")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout all error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during logout from all devices"
        )
