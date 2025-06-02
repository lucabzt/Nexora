from authlib.integrations.starlette_client import OAuth
from fastapi import HTTPException
from ..config import settings

def get_google_oauth_client() -> OAuth:
    """Initialize and return the Google OAuth client."""
    oauth = OAuth()
    if not oauth:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth client is not configured."
        )
    oauth.register(
        name='google',
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'}
    )
    oauth.redirect_uri = settings.GOOGLE_REDIRECT_URI
    oauth.frontend_base_url = settings.FRONTEND_BASE_URL
    return oauth
