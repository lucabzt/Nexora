from typing import List, Optional
from pydantic import BaseModel, Field

class CourseRequest(BaseModel):
    query: str = Field(..., description="What the user wants to learn")
    time_hours: int = Field(..., ge=1, le=20, description="Time investment in hours")

class MultipleChoiceQuestion(BaseModel):
    question: str
    answer_a: str
    answer_b: str
    answer_c: str
    answer_d: str
    correct_answer: str
    explanation: str

class Chapter(BaseModel):
    index: int
    caption: str
    summary: str
    content: str
    mc_questions: List[MultipleChoiceQuestion]
    time_minutes: int

class CourseResponse(BaseModel):
    status: str
    chapters: List[Chapter]
    session_id: Optional[str] = None
    
class SessionResponse(BaseModel):
    session_id: str