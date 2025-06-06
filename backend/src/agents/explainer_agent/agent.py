"""
This defines a ExplainerAgent class which wraps the event handling,
runner from adk and calls to visualizer agent into a simple run() method
"""
import os
from google.adk.agents import LlmAgent
from google.adk.agents.llm_agent import InstructionProvider
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import Runner

from ..agent import StandardAgent
from ..utils import load_instructions_from_files


class ExplainerAgent(StandardAgent):
    def __init__(self, app_name: str, session_service):
        files = ["explainer_agent/instructions.txt"]
        files.extend([f"explainer_agent/plugin_docs/{filename}" for filename in os.listdir(os.path.join(os.path.dirname(__file__), "plugin_docs"))])
        full_instructions = load_instructions_from_files(sorted(files))

        # LiteLlm("openai/gpt-4.1-2025-04-14")
        # gemini-2.5-pro-preview-05-06
        # gemini-2.5-flash-preview-05-20
        explainer_agent = LlmAgent(
            name="explainer_agent",
            model=LiteLlm("openai/gpt-4.1-2025-04-14"),
            description="Agent for creating engaging visual explanations using react",
            global_instruction=lambda _: full_instructions,
            instruction=
            """
            - - -
            ## Current course creation state
            Initial Interaction:
            Nexora: "What do you want to learn today?"
            User: "{query}"
            
            All chapters, created by the Planner Agent:
            {chapters_str}
            
            Please only include content about the chapter that is assigned to you in the following query.
            """,
        )

        # Assign attributes
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=explainer_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )