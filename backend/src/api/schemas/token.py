from typing import Optional
from pydantic import BaseModel

# Token Schemas (remain the same)
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    username: str
    email: str # Added email
    is_admin: bool

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None
    email: Optional[str] = None # Added email
    is_admin: Optional[bool] = None

class LoginForm(BaseModel):
    username: str
    password: str