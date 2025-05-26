"""
This defines a TesterAgent class which wraps the event handling and runner from adk into a simple run() method
"""
import json
from typing import Dict, Any

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.genai import types

from ..utils import load_instruction_from_file
from .schema import Test

class TesterAgent:
    def __init__(self, app_name: str, session_service):
        tester_agent = LlmAgent(
            name="tester_agent",
            model="gemini-2.5-flash-preview-05-20",
            description="Agent for testing the user on studied material",
            output_schema=Test,
            instruction=load_instruction_from_file("tester/instructions.txt"),
            disallow_transfer_to_parent=True,
            disallow_transfer_to_peers=True
        )

        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=tester_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )

    async def run(self, user_id: str, session_id: str, content: types.Content, debug: bool = False) -> Dict[str, Any]:
        """
        Run the tester agent with error handling
        """
        try:
            async for event in self.runner.run_async(
                    user_id=user_id,
                    session_id=session_id,
                    new_message=content
            ):
                if debug:
                    print(f"[TesterAgent] Author: {event.author}, Type: {type(event).__name__}, "
                          f"Final: {event.is_final_response()}")

                if event.is_final_response():
                    if event.content and event.content.parts:
                        json_text = event.content.parts[0].text
                        try:
                            dict_response = json.loads(json_text)
                            dict_response['status'] = 'success'
                            return dict_response
                        except json.JSONDecodeError as e:
                            print(f"TesterAgent JSON decode error: {e}")
                            print(f"Raw response: {json_text}")
                            return {
                                "status": "error",
                                "message": f"Failed to parse tester response: {str(e)}"
                            }
                    elif event.actions and event.actions.escalate:
                        return {
                            "status": "error",
                            "message": f"Tester agent escalated: {event.error_message or 'No specific message.'}"
                        }
            
            return {
                "status": "error",
                "message": "Tester agent did not give a final response",
            }
        except Exception as e:
            print(f"TesterAgent unexpected error: {e}")
            return {
                "status": "error",
                "message": f"Tester agent error: {str(e)}"
            }