from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class CourseRequest(BaseModel):
    """Request schema for creating a course session."""
    query: str = Field(..., description="What the user wants to learn")
    time_hours: int = Field(..., description="Time investment in hours")
    document_ids: List[int] = Field(default=[], description="Document IDs")
    picture_ids: List[int] = Field(default=[], description="Picture IDs")


class MultipleChoiceQuestion(BaseModel):
    """Schema for a multiple-choice question."""
    question: str
    answer_a: str
    answer_b: str
    answer_c: str
    answer_d: str
    correct_answer: str
    explanation: str


class Chapter(BaseModel):
    """Schema for a chapter in the course."""
    id: int  # Add this line to include the database ID
    index: int
    caption: str
    summary: str
    content: str
    mc_questions: List[MultipleChoiceQuestion]
    time_minutes: int
    is_completed: bool = False  # Also useful for the frontend


class CourseInfo(BaseModel):
    """Schema for a list of courses."""
    course_id: int
    title: str
    description: str
    session_id: str
    status: str = "creating"  # creating, finished, updating
    total_time_hours: Optional[int] = None

class Course(BaseModel):
    """Schema for a course."""
    course_id: int
    title: str
    description: str
    session_id: str
    status: str = "creating"
    total_time_hours: Optional[int] = None
    chapters: List[Chapter]
