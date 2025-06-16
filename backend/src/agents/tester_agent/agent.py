"""
This defines a TesterAgent class which wraps the event handling and runner from adk into a simple run() method
"""
import json
from typing import Dict, Any

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.genai import types

from ..agent import StructuredAgent
from ..utils import load_instruction_from_file
from .schema import Test


class TesterAgent(StructuredAgent):
    def __init__(self, app_name: str, session_service):
        # Create the planner agent
        tester_agent = LlmAgent(
            name="tester_agent",
            model="gemini-2.0-flash",
            description="Agent for testing the user on studied material",
            output_schema=Test,
            instruction=load_instruction_from_file("tester_agent/instructions.txt"),
            disallow_transfer_to_parent=True,
            disallow_transfer_to_peers=True
        )

        # Create necessary
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=tester_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )


class TesterReviewAgent(StructuredAgent):
    """
    Custom loop agent to provide a feedback loop between the tester agent and the react parser.
    I unfortunately cannot use adks loop agent because of missing functionality,
    see https://github.com/google/adk-python/issues/1235
    """

    def __init__(self, app_name: str, session_service, iterations=5):
        self.explainer = CodeWriterAgent(app_name=app_name, session_service=session_service)
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
                print(
                    f"!!WARNING: Code did not pass syntax validation. Errors: \n{json.dumps(validation_check['errors'], indent=2)}")

        return {
            "success": False,
            "message": f"Code did not pass syntax check after {self.iterations} iterations. Errors: \n{json.dumps(validation_check['errors'], indent=2)}",
        }