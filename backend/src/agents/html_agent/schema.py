"""
This file defines the output format of the html agent.
"""
from typing import List
from pydantic import BaseModel, Field


class HtmlSlides(BaseModel):
    slides: List[str] = Field(description="List of slides. Each slide is html code as a string")