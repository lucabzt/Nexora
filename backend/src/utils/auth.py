from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

# Import the SQLAlchemy User model module correctly
from ..db.models import db_user as user_model
# Import Pydantic schemas (only TokenData is directly used here)
from ..db.database import get_db
# Import security utilities
from ..core.security import verify_password
# Import settings
from ..config.settings import SECRET_KEY, ALGORITHM

# OAuth2 with Password Flow
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # Relative URL for token endpoint

def authenticate_user(db: Session, username: str, password: str) -> Optional[user_model.User]:
    """Authenticate a user by username and password."""
    authenticated_db_user = db.query(user_model.User).filter(user_model.User.username == username).first()
    if not authenticated_db_user:
        return None
    if not verify_password(password, authenticated_db_user.hashed_password):
        return None
    return authenticated_db_user # Return the SQLAlchemy user model instance

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> user_model.User:
    """Get the current user based on the provided token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload is None:
            raise credentials_exception
        username = payload.get("sub")
        user_id = payload.get("user_id")
        #is_admin: bool = payload.get("is_admin", False)
        if username is None or user_id is None:
            raise credentials_exception
        # token_data = token.TokenData(username=username, user_id=user_id, is_admin=is_admin)
    except JWTError as exc:
        raise credentials_exception from exc
    
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_db_user: user_model.User = Depends(get_current_user)) -> user_model.User:
    """Ensure the current user is active."""
    if not bool(current_db_user.is_active):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_db_user

async def get_current_admin_user(current_db_user: user_model.User = Depends(get_current_active_user)) -> user_model.User:
    """Ensure the current user is an admin."""
     # Check if the user is an admin
     # If not, raise a 403 Forbidden error
    if not bool(current_db_user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_db_user