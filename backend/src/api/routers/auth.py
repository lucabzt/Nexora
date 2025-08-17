"""
Authentication Router
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi import FastAPI, Response, Cookie



from ...db.database import get_db
from ...services import auth_service
from ...core.security import oauth
from ...config import settings
from ..schemas import auth as auth_schema
from ..schemas import user as user_schema
from ...utils import auth as auth_utils
from ...core.security import get_refresh_token_from_cookie

api_router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={404: {"description": "Not found"}},
)

@api_router.post("/signup",
                  response_model=auth_schema.APIResponseStatus,
                  status_code=status.HTTP_201_CREATED)
async def register_user(response: Response,
                        user_data: user_schema.UserCreate,
                        db: Session = Depends(get_db)):
    """
    Endpoint to register a new user.
    Returns the status of the registration.
    """
    return await auth_service.register_user(user_data, db, response)



@api_router.post("/login",
                 response_model=auth_schema.APIResponseStatus)
async def login_user(response: Response,
                     form_data: OAuth2PasswordRequestForm = Depends(),
                     db: Session = Depends(get_db)):
    """
    Endpoint to login and obtain an access token.
    Use /users/me to get user details.
    """
    return await auth_service.login_user(form_data, db, response)


@api_router.post("/admin/login-as/{user_id}",
                 response_model=auth_schema.APIResponseStatus)
async def login_as(
    user_id: str,
    response: Response,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(auth_utils.get_current_admin_user)
):
    """
    Endpoint for admin to login as another user. (Admin only)
    This will log out the current admin and log in as the specified user.
    
    Args:
        user_id: The ID of the user to log in as
    """
    return await auth_service.admin_login_as(current_user.id, user_id, db, response)


@api_router.post("/logout",
                 response_model=auth_schema.APIResponseStatus)
async def logout_user(response: Response,
                      db: Session = Depends(get_db),
                      user: user_schema.User = Depends(auth_utils.get_current_active_user)):
    """
    Endpoint to logout user.
    This endpoint invalidates the user's session and access token.
    """
    return await auth_service.logout_user(user, db, response)

@api_router.post("/refresh",
                 response_model=auth_schema.APIResponseStatus)
async def refresh_token(response: Response,
                        db: Session = Depends(get_db),
                        refresh_token_str: Optional[str] = Depends(get_refresh_token_from_cookie)):
    """
    Endpoint to refresh the user's access token.
    """
    return await auth_service.refresh_token(refresh_token_str, db, response)


@api_router.get("/login/google")
async def login_google(request: Request):
    """
    Redirects the user to Google OAuth for authentication.
    This endpoint initiates the OAuth flow by redirecting to Google's authorization URL.
    """
    if not oauth.google:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth client is not configured."
        )
    return await oauth.google.authorize_redirect(request, settings.GOOGLE_REDIRECT_URI)


@api_router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handles the callback from Google OAuth after user authentication.
    """
    return await auth_service.handle_oauth_callback(request, db, website="google")



@api_router.get("/login/github")
async def login_github(request: Request):
    """
    Redirects the user to Github OAuth for authentication.
    This endpoint initiates the OAuth flow by redirecting to github's authorization URL.
    """
    if not oauth.github:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="github OAuth client is not configured."
        )
    return await oauth.github.authorize_redirect(request, settings.GITHUB_REDIRECT_URI)


@api_router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handles the callback from Github OAuth after user authentication.
    """
    return await auth_service.handle_oauth_callback(request, db, website="github")


@api_router.get("/login/discord")
async def login_discord(request: Request):
    """
    Redirects the user to Discord OAuth for authentication.
    This endpoint initiates the OAuth flow by redirecting to Discord's authorization URL.
    """
    if not oauth.discord:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Discord OAuth client is not configured."
        )
    return await oauth.discord.authorize_redirect(request, settings.DISCORD_REDIRECT_URI)


@api_router.get("/discord/callback")
async def discord_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handles the callback from Discord OAuth after user authentication.
    """
    return await auth_service.handle_oauth_callback(request, db, website="discord")


