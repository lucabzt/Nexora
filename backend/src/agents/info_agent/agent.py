"""
This is a small question-answer agent that functions like a standard gemini api call.
It is used for small requests like generating a course description.
It also handles session creation itself, which sets it apart from the other agents.
"""
import json
from typing import Dict, Any

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.genai import types
from .schema import CourseInfo
from ..agent import StructuredAgent
from ..utils import load_instruction_from_file


class InfoAgent(StructuredAgent):
    def __init__(self, app_name: str, session_service):
        # Create the planner agent
        info_agent = LlmAgent(
            name="info_agent",
            model="gemini-1.5-flash-8b",
            output_schema=CourseInfo,
            description="Agent for creating a small info for a course",
            instruction=load_instruction_from_file("info_agent/instructions.txt"),
            disallow_transfer_to_parent=True,
            disallow_transfer_to_peers=True,
        )

        # Create necessary
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=info_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )
