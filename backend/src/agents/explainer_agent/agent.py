"""
This defines a ExplainerAgent class which wraps the event handling,
runner from adk and calls to visualizer agent into a simple run() method
"""
import os
from google.adk.agents import LlmAgent
from google.adk.runners import Runner

from ..agent import StandardAgent
from ..utils import load_instructions_from_files


class ExplainerAgent(StandardAgent):
    def __init__(self, app_name: str, session_service):
        files = ["explainer_agent/instructions.txt"]
        files.extend([f"explainer_agent/plugin_docs/{filename}" for filename in os.listdir(os.path.join(os.path.dirname(__file__), "plugin_docs"))])
        full_instructions = load_instructions_from_files(sorted(files))

        # LiteLlm("anthropic/claude-3-7-sonnet-latest")
        # gemini-2.5-pro-preview-05-06
        # gemini-2.5-flash-preview-05-20
        explainer_agent = LlmAgent(
            name="explainer_agent",
            model="gemini-2.5-flash-preview-05-20",
            description="Agent for creating engaging visual explanations using react",
            instruction=full_instructions,
        )

        # Assign attributes
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=explainer_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )