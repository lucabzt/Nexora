from pydantic import BaseModel
from typing import Any, Optional, Literal

class APIResponseStatus(BaseModel):
    """Base model for API responses."""
    status: Literal["success", "error"]
    msg: str
    data: Optional[Any] = None

