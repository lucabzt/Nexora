from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class CourseRequest(BaseModel):
    """Request schema for creating a course session."""
    query: str = Field(..., description="What the user wants to learn")
    time_hours: int = Field(..., description="Time investment in hours")
    document_ids: List[int] = Field(default=[], description="Document IDs")
    picture_ids: List[int] = Field(default=[], description="Picture IDs")
    language: str = Field(..., description="Language")
    difficulty: str = Field(..., description="Difficulty")


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

    class Config:
        from_attributes = True  # For Pydantic v2 (replaces orm_mode = True)


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
    completed_chapter_count: Optional[int] = None
    user_name: Optional[str] = None
    is_public: Optional[bool] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # For Pydantic v2 (replaces orm_mode = True)


class UpdateCoursePublicStatusRequest(BaseModel):
    """Schema for updating the public status of a course."""
    is_public: bool
