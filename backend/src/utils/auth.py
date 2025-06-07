from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel


# Import the SQLAlchemy User model module correctly
from ..db.models import db_user as user_model
# Import Pydantic schemas (only TokenData is directly used here)
from ..db.database import get_db
# Import security utilities
from ..core import security
from ..core.security import get_access_token_from_cookie
# Import settings

from ..db.crud.users_crud import get_active_user_by_id
from fastapi import Request # Added Request for get_optional_current_user

class TokenData(BaseModel):
    """Schema for the token data."""
    username: Optional[str] = None
    user_id: Optional[str] = None
    email: Optional[str] = None # Added email
    is_admin: Optional[bool] = None


def authenticate_user(db: Session, username: str, password: str) -> Optional[user_model.User]:
    """Authenticate a user by username and password."""
    authenticated_db_user = db.query(user_model.User).filter(user_model.User.username == username).first()
    if not authenticated_db_user:
        return None
    if not security.verify_password(password, authenticated_db_user.hashed_password):
        return None
    return authenticated_db_user # Return the SQLAlchemy user model instance


async def get_current_active_user(access_token: Optional[str] = Depends(get_access_token_from_cookie),
                                  db: Session = Depends(get_db)) -> user_model.User:
    """
    Get the current user based on the provided token.
    Ensures the user is active and returns the user model instance.
    Removed get_current_user dependency to avoid usage of get_current_user instead of get_current_active_user.
    """

    if not access_token:
        # This case should ideally be handled by get_access_token_from_cookie raising an error.
        # If oauth2_scheme is also used as a fallback, you might check a header token here.
        # For a pure cookie-based approach, get_access_token_from_cookie handles the missing token.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: Access token missing",
        )

    # Verify the token and extract user ID
    user_id = security.verify_token(access_token)

    # Fetch the user from the database using the user ID
    user = get_active_user_by_id(db, user_id)

    if user is None:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    return user


async def get_current_user_optional(access_token: Optional[str] = Depends(get_access_token_from_cookie),
                                           db: Session = Depends(get_db)) -> Optional[user_model.User]:
    """
    Get the current user based on the provided token.
    Returns None if the user is not authenticated or not found.
    This is useful for endpoints where the user may not be required to be logged in.
    """
    if not access_token:
        return None  # No token means no user, which is acceptable in this context

    # Verify the token and extract user ID
    user_id = security.verify_token(access_token)
    user = get_active_user_by_id(db, user_id)
    return user # if user else None

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