from typing import List
from pydantic import BaseModel, Field


class CourseRequest(BaseModel):
    """Request schema for creating a course session."""
    query: str = Field(..., description="What the user wants to learn")
    time_hours: int = Field(..., description="Time investment in hours")


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
    index: int
    caption: str
    summary: str
    content: str
    mc_questions: List[MultipleChoiceQuestion]
    time_minutes: int


class Course(BaseModel):
    """Schema for a course."""
    chapters: List[Chapter]
    session_id: str