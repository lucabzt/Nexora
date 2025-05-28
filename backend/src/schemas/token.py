from typing import Optional
from pydantic import BaseModel

# Token Schemas (remain the same)
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    username: str
    is_admin: bool

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None
    is_admin: Optional[bool] = None

class LoginForm(BaseModel):
    username: str
    password: str