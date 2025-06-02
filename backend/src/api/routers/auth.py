"""
Authentication Router
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...services import auth_service
from ..schemas import token as token_schema, user as user_schema
from ...utils.oauth import oauth
from ...config import settings


api_router = APIRouter(
    prefix="",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)


@api_router.post("/token", response_model=token_schema.Token, tags=["authentication"])
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Endpoint to login and obtain an access token.
    Use /users/me to get user details.
    """
    return await auth_service.login_user(form_data, db)


@api_router.post("/register", response_model=user_schema.User, status_code=status.HTTP_201_CREATED,
                 tags=["Authentication"])
async def register_user(user_data: user_schema.UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint to register a new user.
    Returns the created user object.
    """
    return await auth_service.register_user(user_data, db)


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


