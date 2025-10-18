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
    """Create both access and refresh tokens for a user."""
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
        "refresh_token": refresh_token,
        "token_type": "bearer"
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