from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

from authlib.integrations.starlette_client import OAuth
from fastapi import HTTPException, status, Request, Cookie, Response
from jose import JWTError, jwt
from typing import Optional
from passlib.context import CryptContext

from ..config import settings
from ..config.settings import (ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM,
                               PRIVATE_KEY, PUBLIC_KEY, SECRET_KEY,
                               REFRESH_TOKEN_EXPIRE_MINUTES)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth = OAuth()


def verify_password(plain_password, hashed_password):
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)

def create_token(data: dict, expires_delta: timedelta) -> str:
    """Create a JWT access token with an expiration time."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    if ALGORITHM == "HS256":
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    elif ALGORITHM == "RS256":
        return jwt.encode(to_encode, PRIVATE_KEY, algorithm=ALGORITHM)
    else: raise ValueError(f"Unsupported algorithm: {ALGORITHM}")


def create_access_token(data: dict) -> str:
    """Create a JWT access token with a default expiration time."""
    return create_token(data, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token with a longer expiration time."""
    return create_token(data, timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES))


def verify_token(token: Optional[str]) -> str:
    """Verify a JWT token and return the payload with user info."""

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: token missing",
        )

    try:
        if ALGORITHM == "HS256":
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        elif ALGORITHM == "RS256":
            payload = jwt.decode(token, PUBLIC_KEY, algorithms=[ALGORITHM])
        else:
            raise ValueError(f"Unsupported algorithm: {ALGORITHM}")
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from e

    user_id: Optional[str] = payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing required claims",
        )

    return user_id


def set_access_cookie(response : Response, access_token: str):
    """Set the access token cookie in the response."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        path="/",  # send to all paths
        httponly=True,
        secure=settings.SECURE_COOKIE,  # use secure cookies if configured
        samesite="lax" #settings.SAME_SITE,  # use configured SameSite policy
    )


def set_refresh_cookie(response : Response, refresh_token: str):
    """Set the refresh token cookie in the response."""
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        path="/api/auth/refresh",  # restrict refresh token cookie to this path
        httponly=True,
        secure=settings.SECURE_COOKIE,  # use secure cookies if configured
        samesite= "lax" #settings.SAME_SITE,  # use configured SameSite policy
    )



def clear_access_cookie(response : Response):
    """Clear the access token cookie in the response."""
    response.delete_cookie(
        key="access_token",
        path="/",  # send to all paths
    )

def clear_refresh_cookie(response : Response):
    """Clear the refresh token cookie in the response."""
    response.delete_cookie(
        key="refresh_token",
        path="/api/auth/refresh",  # restrict refresh token cookie to this path
    )


async def get_access_token_from_cookie(request: Request) -> Optional[str]:
    """
    Extracts the access token from the request's cookies.
    NOTE! THIS FUNCTION WILL NOT RAISE AN EXCEPTION IF THE TOKEN IS MISSING.
    It will return None if the access token is not found in the cookies.
    This is useful for endpoints where the user may not be required to be logged in.
    Or for future fallback mechanisms where the access token might be in a header or query parameter.
    """
    access_token = request.cookies.get("access_token")

    #if not access_token:
    #    raise HTTPException(
    #        status_code=status.HTTP_401_UNAUTHORIZED,
    #        detail="Not authenticated: Access token missing",
    #    )
    return access_token

async def get_refresh_token_from_cookie(request: Request) -> Optional[str]:
    """
    Extracts the refresh token from the request's cookies.
    NOTE! THIS FUNCTION WILL NOT RAISE AN EXCEPTION IF THE TOKEN IS MISSING.
    It will return None if the access token is not found in the cookies.
    This is useful for endpoints where the user may not be required to be logged in.
    Or for future fallback mechanisms where the access token might be in a header or query parameter.
    """
    refresh_token = request.cookies.get("refresh_token")
    #if not refresh_token:
    #    raise HTTPException(
    #        status_code=status.HTTP_401_UNAUTHORIZED,
    #        detail="Not authenticated: Refresh token missing",
    #    )
    return refresh_token
    

# Google OAuth registration
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
    #redirect_uri=settings.GOOGLE_REDIRECT_URI
)

# GitHub OAuth registration
oauth.register(
    name='github',
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'read:user user:email'},
    #redirect_uri=settings.GITHUB_REDIRECT_URI
)

# Discord OAuth registration
oauth.register(
    name='discord',
    client_id=settings.DISCORD_CLIENT_ID,
    client_secret=settings.DISCORD_CLIENT_SECRET,
    access_token_url='https://discord.com/api/oauth2/token',
    authorize_url='https://discord.com/api/oauth2/authorize',
    api_base_url='https://discord.com/api/',
    client_kwargs={'scope': 'identify email'},
)

