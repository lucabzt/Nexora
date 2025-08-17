from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...db.models import db_user as user_model
from ...services import user_service, auth_service
from ...utils import auth
from ...utils.auth import get_current_user_optional # Import the new dependency
from ..schemas import user as user_schemas  # For Pydantic models
from ..schemas import auth as auth_schemas  # For Pydantic models
from fastapi import FastAPI, Response, Cookie



router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.get("/me",
            response_model=Optional[user_schemas.User],
            summary="Get current logged-in user's profile")
async def read_current_user(
    current_user: Optional[user_model.User] = Depends(get_current_user_optional)
):
    """
    Retrieve the profile of the currently authenticated user.
    Returns user data if a valid session (cookie) is present, otherwise returns null.
    """
    return current_user

@router.get("/",
            response_model=List[user_schemas.User],
            dependencies=[Depends(auth.get_current_admin_user)])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve all users. Only accessible by admin users.
    """
    return user_service.get_users(db, skip=skip, limit=limit)

@router.get("/{user_id:str}", response_model=user_schemas.User)
async def read_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """
    Retrieve a specific user by ID.
    Admin users can retrieve any user. Regular users can only retrieve their own profile.
    """
    return user_service.get_user_by_id(db, user_id, current_user)

@router.put("/{user_id:str}", response_model=user_schemas.User)
async def update_user(
    user_id: str,
    user_update: user_schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """
    Update a user's profile. Admins can update any user,
    regular users can only update their own profile.
    """
    return user_service.update_user(db, user_id, user_update, current_user)

@router.put("/{user_id}/change_password", response_model=user_schemas.User)
async def change_password(
    user_id: str,
    password_data: user_schemas.UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """
    Change a user's password.
    Admins can change any user's password, regular users can only change their own password.
    """
    return user_service.change_password(db, user_id, password_data, current_user)

@router.delete("/{user_id:str}", response_model=user_schemas.User, dependencies=[Depends(auth.get_current_admin_user)])
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_admin_user)
):
    """
    Delete a user. Only accessible by admin users.
    Admins cannot delete themselves.
    """
    return user_service.delete_user(db, user_id, current_user)

@router.delete("/me", response_model=user_schemas.User, dependencies=[Depends(auth.get_current_active_user)])
async def delete_user(
    response: Response,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """
    Delete a user. Only accessible by the user itself.
    """
    auth_service.logout_user(current_user, db, response)
    return user_service.delete_user(db, current_user.id, current_user)


