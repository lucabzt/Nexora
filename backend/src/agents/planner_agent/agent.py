"""
This defines a PlannerAgent class which wraps the event handling and runner from adk into a simple run() method
"""
import json
from typing import Dict, Any

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.genai import types

from ..agent import StructuredAgent
from ..utils import load_instruction_from_file
from .schema import LearningPath


class PlannerAgent(StructuredAgent):
    def __init__(self, app_name: str, session_service):
        # Create the planner agent
        planner_agent = LlmAgent(
            name="planner_agent",
            model="gemini-2.5-flash",
            description="Agent for planning Learning Paths and Courses",
            output_schema=LearningPath,
            instruction=load_instruction_from_file("planner_agent/instructions.txt"),
            disallow_transfer_to_parent=True,
            disallow_transfer_to_peers=True
        )

        # Create necessary
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=planner_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )
