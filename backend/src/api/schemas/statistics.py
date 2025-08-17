from typing import Literal, Optional
from pydantic import BaseModel

class UsagePost(BaseModel):
    user_id: str
    url: Optional[str] = None
    course_id: Optional[int] = None
    chapter_id: Optional[int] = None
    visible: Optional[bool] = None
    timestamp: str = None

