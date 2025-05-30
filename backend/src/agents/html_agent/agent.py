"""
This is the agent to create the main content of the course.
It creates html slides that contain explanations and visualizations.
"""
from google.adk import Runner
from google.adk.agents import LlmAgent

from ..agent import StructuredAgent
from ..utils import load_instruction_from_file
from .schema import HtmlSlides


class HtmlAgent(StructuredAgent):
    def __init__(self, app_name: str, session_service):
        # Create the html agent
        html_agent = LlmAgent(
            name="html_agent",
            model="gemini-2.5-flash-preview-05-20",
            description="Agent for planning Learning Paths and Courses",
            output_schema=HtmlSlides,
            instruction=load_instruction_from_file("html_agent/instructions.txt"),
            disallow_transfer_to_parent=True,
            disallow_transfer_to_peers=True
        )

        # Create necessary
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=html_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )

