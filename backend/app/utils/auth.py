from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select
from app.models.users import User
from app.models.refresh_tokens import RefreshToken, RefreshTokenCreate
from app.config.config import app_config
import secrets
import logging

# FastAPI Response import for type hints
from fastapi import Response

# Configure password hashing
# bcrypt has a 72-byte input limit; bcrypt_sha256 pre-hashes the password to avoid this issue.
# Keep both to verify existing bcrypt hashes while generating new bcrypt_sha256 hashes.
pwd_context = CryptContext(
    schemes=["bcrypt_sha256"],
    deprecated="auto",
)

# JWT Configuration (from app config)
SECRET_KEY = app_config.jwt_secret_key
ALGORITHM = app_config.jwt_algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = app_config.jwt_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS = 30

logger = logging.getLogger(__name__)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password for storage."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token() -> str:
    """Create a secure random refresh token."""
    return secrets.token_urlsafe(32)


def verify_token(token: str) -> Optional[str]:
    """Verify a JWT token and return the username."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None


def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user with email and password."""
    user = session.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user


def create_user_tokens(session: Session, user: User) -> dict:
    """Create both access and refresh tokens for a user. Returns access token and refresh token separately."""
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Create refresh token
    refresh_token = create_refresh_token()
    refresh_token_expires = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Store refresh token in database
    db_refresh_token = RefreshToken(
        token=refresh_token,
        expires_at=refresh_token_expires,
        user_id=user.id
    )
    session.add(db_refresh_token)
    session.commit()
    
    logger.info(f"Tokens created for user {user.email}")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,  # Will be used to set cookie
        "token_type": "bearer",
        "refresh_token_expires": refresh_token_expires
    }


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """Get a user by email address."""
    return session.query(User).filter(User.email == email).first()


def create_user(session: Session, email: str, name: str, password: str) -> User:
    """Create a new user with hashed password."""
    hashed_password = get_password_hash(password)
    user = User(email=email, name=name, password=hashed_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    
    logger.info(f"New user created: {email}")
    
    return user


def update_user_password(session: Session, user: User, new_password: str) -> bool:
    """Update a user's password with proper hashing."""
    try:
        hashed_password = get_password_hash(new_password)
        user.password = hashed_password
        session.add(user)
        session.commit()
        session.refresh(user)
        
        logger.info(f"Password updated successfully for user: {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to update password for user {user.email}: {str(e)}")
        session.rollback()
        return False


def logout_user(session: Session, refresh_token: str) -> bool:
    """
    Logout user from current device by invalidating specific refresh token.
    Returns True if successful, False if token not found.
    """
    try:
        db_token = session.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
        if not db_token:
            logger.warning(f"Logout attempt with invalid refresh token")
            return False
        
        # Get user info for logging before deletion
        user = session.get(User, db_token.user_id)
        user_email = user.email if user else "unknown"
        
        session.delete(db_token)
        session.commit()
        
        logger.info(f"User logged out successfully: {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        session.rollback()
        return False


def logout_user_all_devices(session: Session, user_email: str) -> int:
    """
    Logout user from all devices by invalidating all refresh tokens.
    Returns number of tokens invalidated.
    """
    try:
        user = get_user_by_email(session, user_email)
        if not user:
            logger.warning(f"Logout all devices attempt for non-existent user: {user_email}")
            return 0
        
        # Get all refresh tokens for this user
        user_tokens = session.query(RefreshToken).filter(RefreshToken.user_id == user.id).all()
        token_count = len(user_tokens)
        
        # Delete all tokens
        for token in user_tokens:
            session.delete(token)
        
        session.commit()
        
        logger.info(f"User logged out from all devices: {user_email} ({token_count} tokens invalidated)")
        return token_count
        
    except Exception as e:
        logger.error(f"Error during logout all devices for {user_email}: {str(e)}")
        session.rollback()
        return 0


def set_refresh_token_cookie(response: Response, refresh_token: str) -> None:
    """
    Set refresh token as HTTP-only cookie with secure settings.
    
    Args:
        response: FastAPI Response object
        refresh_token: The refresh token to set in cookie
    """
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=30 * 24 * 60 * 60,  # 30 days in seconds
        httponly=True,
        secure=True,  # Use HTTPS in production
        samesite="strict"
    )


def clear_refresh_token_cookie(response: Response) -> None:
    """
    Clear refresh token cookie.
    
    Args:
        response: FastAPI Response object
    """
    response.delete_cookie(key="refresh_token")