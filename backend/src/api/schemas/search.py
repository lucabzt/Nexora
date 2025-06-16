from typing import Literal, Optional
from pydantic import BaseModel

class SearchResult(BaseModel):
    """Schema for search results that can be either a course or a chapter."""
    id: str
    type: Literal["course", "chapter"]
    title: str
    description: Optional[str] = None
    course_id: Optional[str] = None  # For chapters, to link back to parent course
    course_title: Optional[str] = None  # For chapters, to show parent course title
