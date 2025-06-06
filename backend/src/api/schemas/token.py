from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Token Schemas (remain the same)
class Token(BaseModel):
    """Schema for the authentication token."""
    access_token: str
    token_type: str
    user_id: str
    username: str
    email: str # Added email
    is_admin: bool
    last_login: Optional[datetime] = None # Previous last login time

class TokenData(BaseModel):
    """Schema for the token data."""
    username: Optional[str] = None
    user_id: Optional[str] = None
    email: Optional[str] = None # Added email
    is_admin: Optional[bool] = None

class LoginForm(BaseModel):
    """Schema for the login form."""
    username: str
    password: str