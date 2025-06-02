from sqlalchemy.orm import Session
from ..models.db_user import User

def get_user_by_id(db: Session, user_id: str):
    """Retrieve a user by their ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    """Retrieve a user by their username."""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str):
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
