from app.config.config import app_config
import secrets
import string
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select
from app.models.reset_codes import ResetCode, ResetCodeCreate
from app.models.users import User
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Reset code configuration
RESET_CODE_LENGTH = 6
RESET_CODE_EXPIRE_MINUTES = 10


def generate_reset_code() -> str:
    """Generate a secure 6-digit reset code."""
    # Use digits only for easier user input
    digits = string.digits
    reset_code = ''.join(secrets.choice(digits) for _ in range(RESET_CODE_LENGTH))
    return reset_code


def generate_secure_reset_code() -> str:
    """Generate a more secure alphanumeric reset code."""
    characters = string.ascii_uppercase + string.digits
    reset_code = ''.join(secrets.choice(characters) for _ in range(8))
    return reset_code


def create_reset_code(session: Session, user_id: int) -> str:
    """Create a new reset code for a user and store it in the database."""
    # Clean up any existing unexpired reset codes for this user
    cleanup_user_reset_codes(session, user_id)
    
    # Generate new reset code
    reset_code = generate_reset_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_CODE_EXPIRE_MINUTES)
    
    # Store in database
    db_reset_code = ResetCode(
        code=reset_code,
        expires_at=expires_at,
        user_id=user_id,
        used=False
    )
    
    session.add(db_reset_code)
    session.commit()
    session.refresh(db_reset_code)
    
    logger.info(f"Reset code created for user {user_id}")
    return reset_code


def validate_reset_code(session: Session, code: str) -> Optional[ResetCode]:
    """Validate a reset code and return the ResetCode object if valid."""
    # Find the reset code
    statement = select(ResetCode).where(ResetCode.code == code)
    reset_code = session.exec(statement).first()
    
    if not reset_code:
        logger.warning(f"Reset code not found: {code}")
        return None
    
    # Check if already used
    if reset_code.used:
        logger.warning(f"Reset code already used: {code}")
        return None
    
    # Check if expired
    current_time = datetime.now(timezone.utc)
    expires_at = reset_code.expires_at
    
    # Ensure timezone awareness
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at <= current_time:
        logger.warning(f"Reset code expired: {code}")
        # Clean up expired code
        session.delete(reset_code)
        session.commit()
        return None
    
    return reset_code


def mark_reset_code_as_used(session: Session, reset_code: ResetCode):
    """Mark a reset code as used."""
    reset_code.used = True
    session.add(reset_code)
    session.commit()
    logger.info(f"Reset code marked as used: {reset_code.code}")


def cleanup_user_reset_codes(session: Session, user_id: int):
    """Remove all existing reset codes for a user."""
    statement = select(ResetCode).where(ResetCode.user_id == user_id)
    existing_codes = session.exec(statement).all()
    
    for code in existing_codes:
        session.delete(code)
    
    if existing_codes:
        session.commit()
        logger.info(f"Cleaned up {len(existing_codes)} existing reset codes for user {user_id}")


def cleanup_expired_reset_codes(session: Session):
    """Remove all expired reset codes from the database."""
    current_time = datetime.now(timezone.utc)
    statement = select(ResetCode).where(ResetCode.expires_at <= current_time)
    expired_codes = session.exec(statement).all()
    
    for code in expired_codes:
        session.delete(code)
    
    if expired_codes:
        session.commit()
        logger.info(f"Cleaned up {len(expired_codes)} expired reset codes")
    
    return len(expired_codes)


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """Get a user by email address."""
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def generate_reset_link(reset_code: str, frontend_url: str = None) -> str:
    """Generate a password reset link for the frontend."""
    if frontend_url is None:
        frontend_url = app_config.email.frontend_url
    return f"{frontend_url}/auth/restore-password?code={reset_code}"