from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class CourseRequest(BaseModel):
    """Request schema for creating a course session."""
    query: str = Field(..., description="What the user wants to learn")
    time_hours: int = Field(..., description="Time investment in hours")
    document_ids: List[int] = Field(default=[], description="Document IDs")
    picture_ids: List[int] = Field(default=[], description="Picture IDs")


class Chapter(BaseModel):
    """Schema for a chapter in the course."""
    id: int  # Add this line to include the database ID
    index: int
    caption: str
    summary: str
    content: str
    time_minutes: int
    is_completed: bool = False  # Also useful for the frontend
    image_url: Optional[str] = None  # Optional image URL for the chapter


class CourseInfo(BaseModel):
    """Schema for a list of courses."""
    course_id: int
    total_time_hours: int
    status: str
    # Information from the agent
    title: Optional[str] = None
    description: Optional[str] = None
    chapter_count: Optional[int] = None
    image_url: Optional[str] = None
