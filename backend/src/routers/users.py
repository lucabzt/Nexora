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

@router.get("/", response_model=List[user_schemas.User], dependencies=[Depends(auth.get_current_admin_user)])
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
    """
    Update a user's details.
    Admin users can update any user. Regular users can only update their own profile.
    Admin status can only be changed by other admins.
    """
    db_user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user")

    update_data = user_update.model_dump(exclude_unset=True) # Pydantic V2
    # For Pydantic V1: update_data = user_update.dict(exclude_unset=True)


    if "username" in update_data:
        existing_user = db.query(user_model.User).filter(user_model.User.username == update_data["username"]).first()
        if existing_user and existing_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
        db_user.username = update_data["username"]
    
    if "email" in update_data:
        existing_user = db.query(user_model.User).filter(user_model.User.email == update_data["email"]).first()
        if existing_user and existing_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        db_user.email = update_data["email"]

    if "password" in update_data and update_data["password"]:
        db_user.hashed_password = auth.get_password_hash(update_data["password"])

    if "is_active" in update_data and current_user.is_admin:
        db_user.is_active = update_data["is_active"]
    elif "is_active" in update_data and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can change active status")


    if "is_admin" in update_data and current_user.is_admin:
        # Prevent admin from accidentally removing their own admin status if they are the only admin
        if db_user.id == current_user.id and not update_data["is_admin"]:
             admin_count = db.query(user_model.User).filter(user_model.User.is_admin == True).count()
             if admin_count <= 1:
                 raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove the last admin's privileges")
        db_user.is_admin = update_data["is_admin"]
    elif "is_admin" in update_data and not current_user.is_admin:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can change admin status")

    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/{user_id}", response_model=user_schemas.User, dependencies=[Depends(auth.get_current_admin_user)])
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_admin_user) # Ensure admin is deleting
):
    """
    Delete a user. Only accessible by admin users.
    Admins cannot delete themselves.
    """
    db_user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if db_user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admins cannot delete themselves")

    db.delete(db_user)
    db.commit()
    return db_user