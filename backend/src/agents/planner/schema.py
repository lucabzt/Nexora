"""
This file defines the output format of the planner agent.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class Chapter(BaseModel):
    caption: str = (
        Field(description="Short caption of the chapter. Optimally 1-5 words"))
    content: List[str] = (
        Field(description="Content of the chapter. "
                          "Each element of the list should be a short description (one bullet point/sentence)"))
    time: int = (
        Field(description="Time of the chapter in minutes."))
    note: Optional[str] = (
        Field(description="If you could not fit some information into caption or content just dump it here"))


class LearningPath(BaseModel):
    chapters: List[Chapter] = (
        Field(description="This is a list of chapters for the learning path"))