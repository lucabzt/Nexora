"""
This defines a PlannerAgent class which wraps the event handling and runner from adk into a simple run() method
"""
import json
from typing import Dict, Any

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.genai import types

from ..utils import load_instruction_from_file
from .schema import LearningPath


class PlannerAgent:
    def __init__(self, app_name: str, session_service):
        # Create the planner agent
        planner_agent = LlmAgent(
            name="planner_agent",
            model="gemini-2.5-flash-preview-05-20",
            description="Agent for planning Learning Paths and Courses",
            output_schema=LearningPath,
            instruction=load_instruction_from_file("planner_agent/instructions.txt"),
            disallow_transfer_to_parent=True,
            disallow_transfer_to_peers=True
        )

        # Create necessary
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=planner_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )

    async def run(self, user_id: str, session_id: str, content: types.Content, debug: bool = False) -> Dict[str, Any]:
        """
        Wraps the event handling and runner from adk into a simple run() method that includes error handling
        :param user_id: id of the user
        :param session_id: current session id
        :param content: the user query as a type.Content object
        :param debug: if true the method will print auxiliary outputs (all events)
        :return: the parsed dictionary response from the planner agent
        """

        async for event in self.runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=content
        ):
            if debug:
                print(f"[Event] Author: {event.author}, Type: {type(event).__name__}, "
                      f"Final: {event.is_final_response()}")

            if event.is_final_response():
                if event.content and event.content.parts:
                    # Get the text from the Part object
                    json_text = event.content.parts[0].text

                    # Try parsing the json response into a dictionary
                    try:
                        dict_response = json.loads(json_text)
                        dict_response['status'] = 'success'
                        return dict_response
                    except json.JSONDecodeError as e:
                        print(f"Error parsing JSON response: {e}")
                        print(f"Raw response: {json_text}")
                        raise
                elif event.actions and event.actions.escalate:  # Handle potential errors/escalations
                    return {
                        "status": "error",
                        "message": f"Agent escalated: {event.error_message or 'No specific message.'}"
                    }
        return {
            "status": "error",
            "message": "agent did not give a final respond. unknown error occurred",
        }
