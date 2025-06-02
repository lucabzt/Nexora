"""
This defines a ExplainerAgent class which wraps the event handling,
runner from adk and calls to visualizer agent into a simple run() method
"""
from google.adk.agents import LlmAgent
from google.adk.runners import Runner

from ..agent import StandardAgent
from ..utils import load_instruction_from_file


class ExplainerAgent(StandardAgent):
    def __init__(self, app_name: str, session_service):
        # Create the planner agent
        explainer_agent = LlmAgent(
            name="explainer_agent",
            model="gemini-2.0-flash",
            description="Agent for creating engaging and simple explanations for complex topics",
            instruction=load_instruction_from_file("explainer_agent/instructions.txt"),
        )

        # Assign attributes
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=explainer_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )