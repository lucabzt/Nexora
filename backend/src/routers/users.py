from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..schemas import user as user_schemas # For Pydantic models
from ..models import db_user as user_model   # For SQLAlchemy model
from ..utils import auth
from ..db.database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[user_schemas.User],
            dependencies=[Depends(auth.get_current_admin_user)])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve all users. Only accessible by admin users.
    """
    users = db.query(user_model.User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=user_schemas.User)
async def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """
    Retrieve a specific user by ID.
    Admin users can retrieve any user. Regular users can only retrieve their own profile.
    """
    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this user")
    
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/{user_id}", response_model=user_schemas.User)
async def update_user(
    user_id: int,
    user_update: user_schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    db_user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Authorization check: User can update themselves, or admin can update any user
    if db_user.id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user")

    update_data = user_update.model_dump(exclude_unset=True)

    if "password" in update_data and update_data["password"]:
        # This route is not for password change, direct to /change_password
        if db_user.id == current_user.id:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Use /change_password to update your password.")
        elif current_user.is_admin: # Admin changing another user's password
            hashed_password = auth.get_password_hash(update_data["password"])
            update_data["password"] = hashed_password
    elif "password" in update_data: # Password field exists but is empty or None
        del update_data["password"] # Don't update password if not provided / or if it's an attempt by non-admin

    # Admin-only fields
    if not current_user.is_admin:
        if "is_active" in update_data:
            del update_data["is_active"]
        if "is_admin" in update_data:
            del update_data["is_admin"]

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}/change_password", response_model=user_schemas.User)
async def change_password(
    user_id: int,
    password_data: user_schemas.UserPasswordUpdate, # Use a dedicated schema for password change
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    if user_id != current_user.id and not current_user.is_admin: # Admin can change other user's password
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to change this user's password")

    db_user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not password_data.new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password not provided")

    # Optional: Add old password verification for non-admin users
    if not current_user.is_admin and password_data.old_password:
        if not auth.verify_password(password_data.old_password, db_user.hashed_password):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect old password")
    elif not current_user.is_admin and not password_data.old_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Old password is required")


    hashed_password = auth.get_password_hash(password_data.new_password)
    db_user.hashed_password = hashed_password
    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/{user_id}", response_model=user_schemas.User)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_admin_user) # Ensure only admin can delete
):
    """
    Delete a user. Only accessible by admin users.
    Admins cannot delete themselves.
    """
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins cannot delete themselves.")

    db_user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return db_user