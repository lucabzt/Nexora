from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session


# Import the SQLAlchemy User model module correctly
from ..models import db_user as user_model # Use a consistent alias for the SQLAlchemy model module
# Import Pydantic schemas (only TokenData is directly used here)
from ..schemas import token as token_schema # Alias for Pydantic token schemas
from ..db.database import get_db

# Configuration
from ..config.settings import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Password-Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 with Password Flow
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # Relative URL for token endpoint

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str) -> Optional[user_model.User]:
    authenticated_db_user = db.query(user_model.User).filter(user_model.User.username == username).first()
    if not authenticated_db_user:
        return None
    if not verify_password(password, authenticated_db_user.hashed_password):
        return None
    return authenticated_db_user # Return the SQLAlchemy user model instance

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> user_model.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        is_admin: bool = payload.get("is_admin", False)
        if username is None or user_id is None:
            raise credentials_exception
        # token_data = token.TokenData(username=username, user_id=user_id, is_admin=is_admin)
    except JWTError:
        raise credentials_exception
    
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_db_user: user_model.User = Depends(get_current_user)) -> user_model.User:
    if not current_db_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_db_user

async def get_current_admin_user(current_db_user: user_model.User = Depends(get_current_active_user)) -> user_model.User:
    if not current_db_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_db_user