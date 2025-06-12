from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class ChatRequest(BaseModel):
    message: str = Field(..., description="Query message to send to the chat.")
    images: Optional[List[int]] = Field(None, description="List of image File IDs (optional)")

class ChatResponse(BaseModel):
    role: Literal["user", "assistant"] = Field(..., description="Who sent the message.")
    content: str = Field(..., description="The message text.")
    timestamp: Optional[datetime] = Field(None, description="Timestamp of the message (optional, set by frontend or backend)")
