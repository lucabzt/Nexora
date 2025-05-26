from typing import Optional
from pydantic import BaseModel

# Token Schemas (remain the same)
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    is_admin: bool

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    is_admin: Optional[bool] = None

class LoginForm(BaseModel):
    username: str
    password: str