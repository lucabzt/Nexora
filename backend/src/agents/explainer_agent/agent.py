"""
This defines a ExplainerAgent class which wraps the event handling,
runner from adk and calls to visualizer agent into a simple run() method
"""
import json
import os
from typing import AsyncGenerator, Optional, Dict, Any

from google.adk.agents import LlmAgent, BaseAgent, LoopAgent
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import Runner
from google.genai import types
from litellm import max_tokens

from ..code_checker.code_checker import ESLintValidator, clean_up_response
from ..agent import StandardAgent
from ..utils import load_instructions_from_files, create_text_query


class CodingExplainer(StandardAgent):
    def __init__(self, app_name: str, session_service):
        files = ["explainer_agent/instructions.txt"]
        files.extend([f"explainer_agent/plugin_docs/{filename}" for filename in os.listdir(os.path.join(os.path.dirname(__file__), "plugin_docs"))])
        full_instructions = load_instructions_from_files(sorted(files))

        dynamic_instructions = """
END OF INSTRUCTIONS
- - - - - -
## Current course creation state
Initial Interaction:
Nexora: "What do you want to learn today?"
User: "{query}"

All chapters, created by the Planner Agent:
{chapters_str}

Please only include content about the chapter that is assigned to you in the following query.
        """

        # LiteLlm("openai/gpt-4.1-2025-04-14")
        # gemini-2.5-pro
        # gemini-2.5-flash
        # gemini-2.5-flash-lite-preview-06-17
        """LiteLlm(
                model="anthropic/claude-sonnet-4-20250514",
                reasoning_effort="low",
                max_tokens=8100,
            )"""
        explainer_agent = LlmAgent(
            name="explainer_agent",
            model="gemini-2.5-pro",
            description="Agent for creating engaging visual explanations using react",
            global_instruction=lambda _: full_instructions,
            instruction=dynamic_instructions,
            
        )

        # Assign attributes
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=explainer_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )


class ExplainerAgent(StandardAgent):
    """
    Custom loop agent to provide a feedback loop between the explainer and the react parser.
    I unfortunately cannot use adks loop agent because of missing functionality,
    see https://github.com/google/adk-python/issues/1235
    """
    def __init__(self, app_name: str, session_service, iterations = 5):
        self.explainer = CodingExplainer(app_name=app_name, session_service=session_service)
        self.eslint = ESLintValidator()
        self.iterations = iterations

    async def run(self, user_id: str, state: dict, content: types.Content, debug: bool = False) -> Dict[str, Any]:
        """
        Simple for loop to create the logic for the iterated code review.
        :param user_id: id of the user
        :param state: the state created from the StateService
        :param content: the user query as a type.Content object
        :param debug: if true the method will print auxiliary outputs (all events)
        :return: the parsed dictionary response from the agent
        """
        validation_check = {"errors": []}
        for _ in range(self.iterations):
            output = (await self.explainer.run(user_id=user_id, state=state, content=content))['explanation']
            validation_check = self.eslint.validate_jsx(output)
            if validation_check['valid']:
                print("Code Validation Passed")
                return {
                    "success": True,
                    "explanation": clean_up_response(output),
                }
            else:
                content = create_text_query(
                f"""
                You were prompted before, but the code that you output did not pass the syntax validation check.
                Your previous code:
                {output}
                Your code generated the following errors:
                {json.dumps(validation_check['errors'], indent=2)}
                
                Please try again and rewrite your code from scratch, without explanation.
                Your response should start with () => and end with a curly brace.
                """)
                print(f"!!WARNING: Code did not pass syntax validation. Errors: \n{json.dumps(validation_check['errors'], indent=2)}")

        return {
            "success": False,
            "message": f"Code did not pass syntax check after {self.iterations} iterations. Errors: \n{json.dumps(validation_check['errors'], indent=2)}",
        }
