"""
This file defines the output format of the planner agent.
"""
from typing import List, Literal
from pydantic import BaseModel, Field


class McQuestion(BaseModel):
    question: str = Field(description="The question")
    answer_a: str = Field(description="Answer option A")
    answer_b: str = Field(description="Answer option B")
    answer_c: str = Field(description="Answer option C")
    answer_d: str = Field(description="Answer option D")
    correct_answer: Literal["a", "b", "c", "d"] = Field(
        description="The letter of the correct answer (must be a, b, c, or d)"
    )
    explanation: str = Field(description="Short explanation why the answer is correct")

class TextFieldQuestion(BaseModel):
    question: str = Field(description="The question")
    correct_answer: str = Field(description="The correct answer")


class Test(BaseModel):
    questions: List[McQuestion | TextFieldQuestion] = (
        Field(description="These are the questions the user will be tested on"))
