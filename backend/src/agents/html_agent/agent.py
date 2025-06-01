"""
This is the agent to create the main content of the course.
It creates html slides that contain explanations and visualizations.
"""
import os

from google.adk import Runner
from google.adk.agents import LlmAgent

from ..agent import StandardAgent
from ..utils import load_instructions_from_files

from google.adk.models.lite_llm import LiteLlm


class HtmlAgent(StandardAgent):
    def __init__(self, app_name: str, session_service):
        # Combine instructions to include revealjs docs
        files = ["html_agent/instructions.txt"]
        files.extend([f"html_agent/revealjs_docs/{filename}" for filename in os.listdir(os.path.join(os.path.dirname(__file__), "revealjs_docs"))])
        full_instructions = load_instructions_from_files(sorted(files))

        # Create the html agent
        # LiteLlm("anthropic/claude-3-7-sonnet-latest")
        # gemini-2.5-pro-preview-05-06
        # gemini-2.5-flash-preview-05-20
        html_agent = LlmAgent(
            name="html_agent",
            model="gemini-2.5-flash-preview-05-20",
            description="Agent for creating reveal.js slide decks for great explanations and visualizations.",
            instruction=full_instructions,
        )

        # Create necessary
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=html_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )

