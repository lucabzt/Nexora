"""
Authentication service for handling user login,
registration, and Google OAuth callback.
"""
import base64
import secrets
from typing import Optional
import uuid
from logging import Logger
import traceback



import requests
from fastapi import HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..api.schemas import auth as auth_schema
from ..api.schemas import user as user_schema
from ..config import settings as settings
from ..core import security
from ..core.security import oauth
from ..db.crud import users_crud
from ..db.models.db_user import User as UserModel
from ..db.crud import usage_crud


logger = Logger(__name__)

async def login_user(form_data: OAuth2PasswordRequestForm, db: Session, response: Response) -> auth_schema.APIResponseStatus:
    """Authenticates a user and returns an access token."""
    if not form_data.username or not form_data.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Username and password are required")
    
    # Check if the user exists and verify the password
    user = users_crud.get_user_by_username(db, form_data.username)
    if not user:
        user = users_crud.get_user_by_email(db, form_data.username)

    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Incorrect username or password")
    if not user.is_active: # type: ignore
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Inactive user")

    # Generate access token with user details
    access_token = security.create_access_token(
        data={"sub": user.username,
              "user_id": user.id,
              "is_admin": user.is_admin,
              "email": user.email}
    )

    refresh_token = security.create_refresh_token(
        data={"sub": user.username,
              "user_id": user.id,
              "is_admin": user.is_admin,
              "email": user.email}
    )

    # Save last login time
    previous_last_login = user.last_login
    users_crud.update_user_last_login(db, user_id=str(user.id))
    # Log the user login action
    usage_crud.log_login(db, user_id=str(user.id))


    # Set the access token in the response cookie
    security.set_access_cookie(response, access_token)
    # Set the refresh token in the response cookie
    security.set_refresh_cookie(response, refresh_token)

    return auth_schema.APIResponseStatus(status="success",
                                         msg="Successfully logged in",
                                         data={ "last_login": previous_last_login.isoformat()})

async def admin_login_as(current_user_id: str, user_id: str, db: Session, response: Response) -> auth_schema.APIResponseStatus:
    """
    Logs in as a specified user (admin only).
    
    Args:
        user_id: The ID of the user to log in as
        db: Database session
        response: FastAPI response object for setting cookies
        
    Returns:
        APIResponseStatus with login status
        
    Raises:
        HTTPException: If user not found or not active
    """
    # Get the target user
    user = users_crud.get_user_by_id(db, user_id)
    if not user:
        logger.warning("Attempted to log in as non-existent user ID: %s", user_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    # Check if the target user is active
    if user.is_admin:
        logger.warning("Attempted to log in as admin user: %s (ID: %s)", user.username, user.id)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot log in as another admin user"
        )
        
    # Log the admin action
    logger.info(
        "Admin login-as action: Admin ID: %s is logging in as user: %s (ID: %s)",
        current_user_id, user.username, user.id
    )

    # Generate access token with user details
    access_token = security.create_access_token(
        data={
            "sub": user.username,
            "user_id": user.id,
            "is_admin": user.is_admin,
            "email": user.email
        }
    )

    refresh_token = security.create_refresh_token(
        data={
            "sub": user.username,
            "user_id": user.id,
            "is_admin": user.is_admin,
            "email": user.email
        }
    )

    # Set the access and refresh tokens in the response cookies
    security.set_access_cookie(response, access_token)
    security.set_refresh_cookie(response, refresh_token)
    
    # Update last login time
    previous_last_login = user.last_login
    # No update on last login!
    usage_crud.log_admin_login_as(db, user_who=current_user_id, user_as=str(user.id))

    return auth_schema.APIResponseStatus(
        status="success",
        msg="Successfully logged in as user",
        data={"last_login": previous_last_login.isoformat() if previous_last_login else None}
    )



async def register_user(user_data: user_schema.UserCreate, db: Session, response: Response) -> auth_schema.APIResponseStatus:
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
    # When a user is registered, created_at and last_login are set by default in the model
    new_user = users_crud.create_user(
        db = db,
        user_id = user_id,
        username = user_data.username,
        email = user_data.email,
        hashed_password = security.get_password_hash(user_data.password),
        profile_image_base64 = user_data.profile_image_base64,
    )

    # Set access cookie
    access_token = security.create_access_token(
        data={"sub": new_user.username,
              "user_id": new_user.id,
              "is_admin": False,
              "email": new_user.email}
    )

    # Set the access token in the response cookie
    refresh_token = security.create_refresh_token(
        data={"sub": new_user.username,
              "user_id": new_user.id,
              "is_admin": False,
              "email": new_user.email}
    )

    # Set the access token in the response cookie
    security.set_access_cookie(response, access_token)
    # Set the refresh token in the response cookie
    security.set_refresh_cookie(response, refresh_token)

    return auth_schema.APIResponseStatus(status="success",
                                        msg="Successfully logged in")



async def logout_user(user: user_schema.User, db: Session, response: Response) -> auth_schema.APIResponseStatus:
    """Logs out a user by clearing the access and refresh tokens."""
    
    # Disable the user session in the database if needed
    #diable_token(db, response)

    # Clear the access token cookie
    security.clear_access_cookie(response)
    # Clear the refresh token cookie
    security.clear_refresh_cookie(response)

    # Log logout
    
    usage_crud.log_logout(db, user_id=str(user.id))

    return auth_schema.APIResponseStatus(status="success", msg="Successfully logged out")
    
async def refresh_token(token: Optional[str], db: Session, response: Response) -> auth_schema.APIResponseStatus:
    """Registers a new user and returns the created user data."""
    
    # Verify the token and extract user ID
    user_id = security.verify_token(token)

    # Fetch the user from the database using the user ID
    user = users_crud.get_active_user_by_id(db, user_id)

    if user is None:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
    )

    access_token = security.create_access_token(
        data={"sub": user.username,
              "user_id": user.id,
              "is_admin": user.is_admin,
              "email": user.email}
    )
    # Log the user refresh action
    usage_crud.log_refresh(db, user_id=str(user.id))

    # Set the access token in the response cookie
    security.set_access_cookie(response, access_token)

    return auth_schema.APIResponseStatus(status="success", msg="")



async def handle_oauth_callback(request: Request, db: Session, website: str = "google"):
    """Handles the callback from OAuth after user authentication."""

    # Get the OAuth client
    oauth_client = getattr(oauth, website, None)

    if not oauth_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=website + "OAuth client is not configured."
        )

    # Authorize access token from 

    try:
        token = await oauth_client.authorize_access_token(request)
    except Exception as error:
        logger.error("OAuth callback error for %s: %s", website, traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Could not validate credentials") from error

    # Fetch user info from the token
    if website == "github":
        # GitHub: fetch user info using the access token
        access_token = token.get("access_token")
        headers = {"Authorization": f"token {access_token}"}
        user_response = requests.get("https://api.github.com/user", headers=headers, timeout=10)
        user_response.raise_for_status()
        user_info = user_response.json()
        # Fetch email separately if not public
        email = user_info.get("email")
        if not email:
            emails_response = requests.get("https://api.github.com/user/emails", headers=headers, timeout=10)
            emails_response.raise_for_status()
            emails = emails_response.json()
            primary_emails = [e["email"] for e in emails if e.get("primary") and e.get("verified")]
            email = primary_emails[0] if primary_emails else None
        name = user_info.get("name") or user_info.get("login")
        picture_url = user_info.get("avatar_url")
    elif website == "google":
        user_info = token.get('userinfo')
        if not user_info or not user_info.get("email"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Could not fetch user info from {website}.")
        email = user_info["email"]
        name = user_info.get("name")
        picture_url = user_info.get("picture")
    elif website == "discord":
        access_token = token.get("access_token")
        headers = {"Authorization": f"Bearer {access_token}"}
        user_response = requests.get("https://discord.com/api/users/@me", headers=headers, timeout=10)
        user_response.raise_for_status()
        user_info = user_response.json()
        email = user_info.get("email")
        name = user_info.get("username")
        # Discord avatar URL construction
        avatar = user_info.get("avatar")
        user_id = user_info.get("id")
        if avatar and user_id:
            picture_url = f"https://cdn.discordapp.com/avatars/{user_id}/{avatar}.png"
        else:
            picture_url = None
        if not email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Could not fetch user info from {website}.")
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Unsupported OAuth provider: {website}")

    # Check if the user already exists in the database
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Could not fetch user email from {website}.")
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
        logger.info(f"Creating new user for {website} OAuth login: %s (%s)", email, name)
        # If the user does not exist, create a new user
        base_username = (name.lower().replace(" ", ".")[:40] if name else (email.split("@")[0][:40] if email else "user"))
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
        logger.info(f"Use existung user %s from database for {website} OAuth login.", db_user.username)
        # If the user exists, update their details if necessary
        if profile_image_base64_data and getattr(db_user, 'profile_image_base64',
                                                None) != profile_image_base64_data:
            users_crud.update_user_profile_image(db, db_user, profile_image_base64_data)


    if not db_user or not db_user.is_active: # type: ignore
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="User is inactive.")
    
    # Generate an access token for the user
    access_token = security.create_access_token(
        data={"sub": db_user.username,
              "user_id": db_user.id,
              "is_admin": db_user.is_admin,
              "email": db_user.email}
    )

    # Set the access token in the response cookie
    refresh_token = security.create_refresh_token(
        data={"sub": db_user.username,
              "user_id": db_user.id,
              "is_admin": db_user.is_admin,
              "email": db_user.email}
    )

    # Update the user's last login time
    users_crud.update_user_last_login(db, user_id=str(db_user.id))
    # Log the user login action
    usage_crud.log_login(db, user_id=str(db_user.id))

    # Redirect to the frontend
    frontend_base_url = settings.FRONTEND_BASE_URL
    if not frontend_base_url:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Frontend base URL is not configured.")

    redirect_response = RedirectResponse(url=frontend_base_url)

    # Set the access token in the redirect_response cookie
    redirect_response.set_cookie(
        key="access_token",
        value=access_token,
        path="/",
        httponly=True,
        secure=settings.SECURE_COOKIE,
        samesite="lax"
    )
    # Set the refresh token in the redirect_response cookie
    redirect_response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        path="/api/auth/refresh",
        httponly=True,
        secure=settings.SECURE_COOKIE,
        samesite="lax"
    )

    return redirect_response

