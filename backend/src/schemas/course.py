from typing import List, Dict
from pydantic import BaseModel, Field


class CourseRequest(BaseModel):
    """Request schema for creating a course session."""
    query: str = Field(..., description="What the user wants to learn")
    time_hours: int = Field(..., description="Time investment in hours")
    # Files etc. here, entweder encodes base64 oder files extra hochladen und nur id hier


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
    session_id: int

class Course(CourseInfo):
    """Schema for a course."""
    chapters: List[Chapter]
