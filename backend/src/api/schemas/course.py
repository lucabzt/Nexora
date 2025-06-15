from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

# ORM Schemas (for reading from DB)

class MultipleChoiceQuestion(BaseModel):
    """Schema for a multiple-choice question."""
    id: int
    question: str
    answer_a: str
    answer_b: str
    answer_c: str
    answer_d: str
    correct_answer: str
    explanation: str
    created_at: datetime

    class Config:
        orm_mode = True

class OpenTextQuestion(BaseModel):
    """Schema for an open-text question."""
    id: int
    question: str
    correct_answer: str
    created_at: datetime

    class Config:
        orm_mode = True

class Chapter(BaseModel):
    """Schema for a chapter in the course."""
    id: int
    index: int
    caption: str
    summary: str
    content: str
    mc_questions: List[MultipleChoiceQuestion]
    ot_questions: List[OpenTextQuestion]
    time_minutes: int
    is_completed: bool = False
    image_url: Optional[str] = None

    class Config:
        orm_mode = True

# Request Schemas

class CourseRequest(BaseModel):
    """Request schema for creating a course session."""
    query: str = Field(..., description="What the user wants to learn")
    time_hours: int = Field(..., description="Time investment in hours")
    document_ids: List[int] = Field(default=[], description="Document IDs")
    picture_ids: List[int] = Field(default=[], description="Picture IDs")

# Response Schemas

class QuestionResponse(BaseModel):
    """Schema for a single question in the response."""
    index: int
    id: int
    question_type: str
    question: str
    correct_answer: str
    # MC-specific fields
    answer_a: Optional[str] = None
    answer_b: Optional[str] = None
    answer_c: Optional[str] = None
    answer_d: Optional[str] = None
    explanation: Optional[str] = None

class ChapterResponse(BaseModel):
    """Schema for a chapter in the response."""
    id: int
    index: int
    caption: str
    summary: str
    content: str
    questions: List[QuestionResponse]
    time_minutes: int
    is_completed: bool
    image_url: Optional[str] = None

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
