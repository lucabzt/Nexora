"""
This defines a TesterAgent class which wraps the event handling and runner from adk into a simple run() method
"""
import asyncio
import json
import os
from typing import Dict, Any, Optional

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.genai import types

from ..agent import StructuredAgent, StandardAgent
from ..code_checker.code_checker import ESLintValidator, clean_up_response
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
            model="gemini-2.5-flash",
            description="Agent for testing the user on studied material",
            output_schema=Test,
            global_instruction=lambda _: load_instruction_from_file("tester_agent/instructions.txt") + "\n" + get_full_instructions(),
            instruction="""
            Initial User Query for Course Creation:
            {query}
""",
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
            model="gemini-2.5-flash",
            description="Agent for testing the user on studied material",
            instruction=lambda _: """
Please debug the given react code, using the error message provided. Do not add any code, just debug the existing one.
Please return ONLY the react component in the following format:
() => {...}
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


# ... (all the code before TesterAgent remains the same)

class TesterAgent(StandardAgent):
    """
    Custom loop agent to provide a feedback loop between the explainer and the react parser.
    This agent runs code review for each generated question in parallel for efficiency.
    """

    def __init__(self, app_name: str, session_service, iterations: int = 2):
        self.inital_tester = InitialTesterAgent(app_name=app_name, session_service=session_service)
        self.code_review = CodeReviewAgent(app_name=app_name, session_service=session_service)
        self.eslint = ESLintValidator()
        self.iterations = iterations

    async def _review_and_correct_question(self, question: Dict[str, Any], user_id: str, state: dict) -> Optional[
        Dict[str, Any]]:
        """
        Processes a single question, attempting to validate and correct its code.
        This method will run in a loop up to `self.iterations` times.

        :param question: A dictionary representing a single question.
        :param user_id: The ID of the user.
        :param state: The state created from the StateService.
        :return: The corrected question dictionary if successful, otherwise None.
        """
        code = question['question']
        for i in range(self.iterations):
            validation_check = self.eslint.validate_jsx(code)
            if validation_check['valid']:
                question['question'] = clean_up_response(code)
                # Successfully validated and cleaned, return the result.
                return question

            # If not valid, prepare for a review iteration
            print(
                f"!!WARNING: Question failed validation (Attempt {i + 1}/{self.iterations}). Errors: \n{json.dumps(validation_check['errors'], indent=2)}")
            content = create_text_query(
                f"""
                Please fix the errors in the following code:
                {code}
                The code generated the following errors:
                {json.dumps(validation_check['errors'], indent=2)}

                Please try again and rewrite the code from scratch, without explanation.
                Your response should start with () => and end with a curly brace.
                """
            )
            # Await the correction from the code review agent
            response = await self.code_review.run(user_id=user_id, state=state, content=content)
            if 'explanation' not in response:
                break
            else:
                code = response['explanation']

        # If the loop completes without returning, it means the code could not be fixed.
        print(f"!!ERROR: Could not fix code for a question after {self.iterations} iterations. Discarding question.")
        return None

    async def run(self, user_id: str, state: dict, content: types.Content, debug: bool = False) -> Dict[str, Any]:
        """
        Generates questions and then runs a parallelized code review and correction process.
        :param user_id: id of the user
        :param state: the state created from the StateService
        :param content: the user query as a type.Content object
        :param debug: if true the method will print auxiliary outputs (all events)
        :return: the parsed dictionary response from the agent
        """
        # 1. Get the initial list of questions
        initial_response = await self.inital_tester.run(user_id=user_id, state=state, content=content)
        practice_questions = initial_response.get('questions', [])

        if not practice_questions:
            return {"success": True, "questions": []}

        # 2. Create a list of asynchronous tasks to be run in parallel
        tasks = [
            self._review_and_correct_question(question, user_id, state)
            for question in practice_questions
        ]

        # 3. Run all correction tasks concurrently and await their results
        print(f"Starting parallel review for {len(tasks)} questions...")
        corrected_results = await asyncio.gather(*tasks)
        print("Parallel review complete.")

        # 4. Filter out the results that failed (returned None)
        final_questions = [q for q in corrected_results if q is not None]

        return {
            "success": True,
            "questions": final_questions,
        }