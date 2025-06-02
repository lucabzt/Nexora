"""
Authentication service for handling user login,
registration, and Google OAuth callback.
"""
import secrets
import uuid
import base64
import requests
from datetime import timedelta

from fastapi import HTTPException, status, Request
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..db.crud import users_crud as users_crud
from ..core import security
from ..utils.oauth import get_google_oauth_client
from ..db.models.db_user import User as UserModel
from ..api.schemas import token as token_schema
from ..api.schemas import user as user_schema

from logging import Logger

logger = Logger(__name__)

async def login_user(form_data: OAuth2PasswordRequestForm, db: Session) -> token_schema.Token:
    """Authenticates a user and returns an access token."""
    if not form_data.username or not form_data.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Username and password are required")

    # Check if the user exists and verify the password
    user = users_crud.get_user_by_username(db, form_data.username)

    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Incorrect username or password")
    if not user.is_active: # type: ignore
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Inactive user")

    # Generate access token with user details
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username, "user_id": user.id, "is_admin": user.is_admin, "email": user.email},
        expires_delta=access_token_expires,
    )
    return token_schema.Token(
        access_token= access_token,
        token_type= "bearer",
        user_id= str(user.id),
        username= str(user.username),
        email= str(user.email),
        is_admin= bool(user.is_admin),
    )

async def register_user(user_data: user_schema.UserCreate, db: Session):
    """Registers a new user and returns the created user data."""
    
    # Check if username from incoming data (user_data.username) already exists in the DB
    db_user_by_username = users_crud.get_user_by_username(db, user_data.username)
    if db_user_by_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")

    # Check if email from incoming data (user_data.email) already exists in the DB
    db_user_by_email = users_crud.get_user_by_email(db, user_data.email)
    if db_user_by_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Generate a unique string ID
    user_id = None
    while True:
        user_id = str(uuid.uuid4())
        if not users_crud.get_user_by_id(db, user_id):
            break
    
    # Create the user in the database
    return users_crud.create_user(
        db = db,
        user_id = user_id,
        username = user_data.username,
        email = user_data.email,
        hashed_password = security.get_password_hash(user_data.password),
        is_active = True,
        is_admin = False,
        profile_image_base64 = user_data.profile_image_base64,
    )

async def handle_google_callback(request: Request, db: Session):
    """Handles the callback from Google OAuth after user authentication."""

    # Get the OAuth client
    oauth = get_google_oauth_client()
    if not oauth.google:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth client is not configured."
        )

    # Authorize access token from Google
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Could not validate credentials") from error

    # Fetch user info from the token
    user_info = token.get('userinfo')
    if not user_info or not user_info.get("email"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Could not fetch user info from Google.")
    email = user_info["email"]
    name = user_info.get("name")
    picture_url = user_info.get("picture")
    db_user = db.query(UserModel).filter(UserModel.email == email).first()
    profile_image_base64_data = None

    # If a profile picture URL is provided, fetch the image and convert it to base64
    if picture_url:
        try:
            response = requests.get(picture_url, timeout=10)
            response.raise_for_status()
            profile_image_base64_data = base64.b64encode(response.content).decode('utf-8')
        except requests.exceptions.RequestException:
            profile_image_base64_data = None

    # Check if the user already exists in the database
    if not db_user:
        logger.info("Creating new user for Google OAuth login: %s (%s)", email, name)
        # If the user does not exist, create a new user
        base_username = (name.lower().replace(" ", ".")[:40] if name else email.split("@")[0][:40])
        username_candidate = base_username[:42]
        final_username = username_candidate
        while db.query(UserModel).filter(UserModel.username == final_username).first():
            suffix = secrets.token_hex(3)
            final_username = f"{username_candidate[:42]}.{suffix}"
        random_password = secrets.token_urlsafe(16)
        hashed_password = security.get_password_hash(random_password)

        # Create a new user with the provided details
        db_user = users_crud.create_user(
            db,
            secrets.token_hex(16),
            final_username,
            email,
            hashed_password,
            is_active=True,
            is_admin=False,
            profile_image_base64=profile_image_base64_data,
        )
    else:
        logger.info("Use existung user %s from database for Google OAuth login.", db_user.username)
        # If the user exists, update their details if necessary
        if profile_image_base64_data and getattr(db_user, 'profile_image_base64',
                                                None) != profile_image_base64_data:
            users_crud.update_user_profile_image(db, db_user, profile_image_base64_data)


    if not db_user or not db_user.is_active: # type: ignore
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="User is inactive.")
    
    # Generate an access token for the user
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": db_user.username, "user_id": db_user.id, "is_admin": db_user.is_admin,
              "email": db_user.email},
        expires_delta=access_token_expires,
    )

    # Redirect to the frontend with the access token
    frontend_base_url = oauth.frontend_base_url
    redirect_url_with_fragment = f"{frontend_base_url}#access_token={access_token}&token_type=bearer&expires_in={security.ACCESS_TOKEN_EXPIRE_MINUTES * 60}"

    print("Redirecting to frontend: %s", redirect_url_with_fragment)

    return RedirectResponse(url=redirect_url_with_fragment)
