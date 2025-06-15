"""
This file defines the output format of the planner agent.
"""
from pydantic import BaseModel, Field


class Grading(BaseModel):
    points: int = Field(description="Points earned by the user. Can be either 0, 1 or 2")
    explanation: str = Field(description="Explanation of the correct answer and the evaluation correctness of the users answer (1-3 Sentences)")