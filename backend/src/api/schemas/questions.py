from typing import Optional
from pydantic import BaseModel


class QuestionResponse(BaseModel):
    """Schema for a practice question."""
    id: int
    type: str
    question: str
    answer_a: Optional[str] = None
    answer_b: Optional[str] = None
    answer_c: Optional[str] = None
    answer_d: Optional[str] = None
    correct_answer: str
    explanation: Optional[str] = None
    users_answer: Optional[str] = None
    points_received: Optional[int] = None
    feedback: Optional[str] = None