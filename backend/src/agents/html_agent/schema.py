"""
This file defines the output format of the slide agent.
"""
from typing import List
from pydantic import BaseModel, Field


class JsxSlides(BaseModel):
    slides: List[str] = Field(description="List of slides. Each slide is jsx code as a string")