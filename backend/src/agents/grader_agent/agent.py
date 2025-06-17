"""
This defines a GraderAgent class which wraps the event handling and runner from adk into a simple run() method
"""
import json
from typing import Dict, Any

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.genai import types

from ..agent import StructuredAgent
from ..utils import load_instruction_from_file
from .schema import Grading


class GraderAgent(StructuredAgent):
    def __init__(self, app_name: str, session_service):
        # Create the planner agent
        grader_agent = LlmAgent(
            name="grader_agent",
            model="gemini-2.0-flash",
            description="Agent for testing the user on studied material",
            output_schema=Grading,
            instruction=lambda _: load_instruction_from_file("grader_agent/instructions.txt"),
            disallow_transfer_to_parent=True,
            disallow_transfer_to_peers=True
        )

        # Create necessary
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=grader_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )