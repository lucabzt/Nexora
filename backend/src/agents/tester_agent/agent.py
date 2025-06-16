"""
This defines a TesterAgent class which wraps the event handling and runner from adk into a simple run() method
"""
import json
import os
from typing import Dict, Any

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.genai import types

from ..agent import StructuredAgent, StandardAgent
from ..explainer_agent.code_checker import ESLintValidator, clean_up_response
from ..utils import load_instruction_from_file, create_text_query, load_instructions_from_files
from .schema import Test

def get_full_instructions(code_review: bool = False,):
    """ Returns the full instructions for the initial tester or code review agent."""
    files = ["explainer_agent/instructions.txt"] if not code_review else []
    files.extend([f"explainer_agent/plugin_docs/{filename}" for filename in
                  os.listdir(os.path.join(os.path.dirname(__file__), "plugin_docs"))])
    full_instructions = load_instructions_from_files(sorted(files))
    return full_instructions


class InitialTesterAgent(StructuredAgent):
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

class CodeReviewAgent(StandardAgent):
    def __init__(self, app_name: str, session_service):
        # Create the planner agent
        agent = LlmAgent(
            name="code_review_agent",
            model="gemini-2.0-flash",
            description="Agent for testing the user on studied material",
            instruction=lambda _: """
Please debug the given react code, using the error message provided. Do not add any code, just debug the existing one.
Please return ONLY the react component in the following format:
() => {<code>}
Plugins and their Syntax:\n
""" + get_full_instructions(code_review=True)
        )

        # Create necessary
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )


class TesterAgent(StandardAgent):
    """
    Custom loop agent to provide a feedback loop between the explainer and the react parser.
    I unfortunately cannot use adks loop agent because of missing functionality,
    see https://github.com/google/adk-python/issues/1235
    """

    def __init__(self, app_name: str, session_service, iterations=5):
        self.inital_tester = InitialTesterAgent(app_name=app_name, session_service=session_service)
        self.code_review = CodeReviewAgent(app_name=app_name, session_service=session_service)
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
        practice_questions = (await self.inital_tester.run(user_id=user_id, state=state, content=content))['questions']
        corrected_questions = []
        for question in practice_questions:
            code = question['question']
            for _ in range(self.iterations):
                validation_check = self.eslint.validate_jsx(code)
                if validation_check['valid']:
                    question['question'] = clean_up_response(code)
                    corrected_questions.append(question)
                    break
                else:
                    content = create_text_query(
                        f"""
                    Please fix the errors in the following code:
                    {code}
                    The code generated the following errors:
                    {json.dumps(validation_check['errors'], indent=2)}
    
                    Please try again and rewrite your code from scratch, without explanation.
                    Your response should start with () => and end with a curly brace.
                    """)
                    code = (await self.code_review.run(user_id=user_id, state=state, content=content))['explanation']
                    print(
                        f"!!WARNING: Code did not pass syntax validation. Errors: \n{json.dumps(validation_check['errors'], indent=2)}")

        return {
            "success": True,
            "questions": corrected_questions,
        }