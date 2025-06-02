"""CRUD operations for user management in the database."""
from typing import Optional

from sqlalchemy.orm import Session
from ..models.db_user import User

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Retrieve a user by their ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Retrieve a user by their username."""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve a user by their email."""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session,
                user_id: str,
                username: str,
                email: str, hashed_password: str,
                is_active=True, is_admin=False,
                profile_image_base64=None):
    """Create a new user in the database."""
    user = User(
        id=user_id,
        username=username,
        email=email,
        hashed_password=hashed_password,
        is_active=is_active,
        is_admin=is_admin,
    )
    if profile_image_base64:
        user.profile_image_base64 = profile_image_base64
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user_profile_image(db: Session, user: User, profile_image_base64: str):
    """Update the profile image of an existing user."""
    user.profile_image_base64 = profile_image_base64 # type: ignore
    db.commit()
    db.refresh(user)
    return user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve users with pagination."""
    return db.query(User).offset(skip).limit(limit).all()

def update_user(db: Session, db_user: User, update_data: dict):
    """Update an existing user's information."""
    for key, value in update_data.items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def change_user_password(db: Session, db_user: User, hashed_password: str):
    """Change an existing user's password."""
    setattr(db_user, "hashed_password", hashed_password)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, db_user: User):
    """Delete a user from the database."""
    db.delete(db_user)
    db.commit()
    return db_user
