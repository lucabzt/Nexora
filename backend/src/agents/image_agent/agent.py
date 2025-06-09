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
from ..agent import StandardAgent
from ..utils import load_instruction_from_file
from ..tools.unsplash_tool import unsplash_tool

class ImageAgent(StandardAgent):
    def __init__(self, app_name: str, session_service):
        # Create the planner agent
        image_agent = LlmAgent(
            name="image_agent",
            model="gemini-1.5-flash-8b",
            description="Agent for searching an image for a course",
            instruction=load_instruction_from_file("image_agent/instructions.txt"),
            disallow_transfer_to_parent=True,
            disallow_transfer_to_peers=True,
            tools=[unsplash_tool]
        )

        # Create necessary
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=image_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )
