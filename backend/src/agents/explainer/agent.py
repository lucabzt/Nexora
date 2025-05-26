"""
This defines a ExplainerAgent class which wraps the event handling,
runner from adk and calls to visualizer agent into a simple run() method
"""
from typing import Dict, Any
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.genai import types

from ..utils import load_instruction_from_file

class ExplainerAgent:
    def __init__(self, app_name: str, session_service):
        explainer_agent = LlmAgent(
            name="explainer_agent",
            model="gemini-2.5-flash-preview-05-20",
            description="Agent for creating engaging and simple explanations for complex topics",
            instruction=load_instruction_from_file("explainer/instructions.txt"),
            disallow_transfer_to_parent=True,
            disallow_transfer_to_peers=True
        )

        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=explainer_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )

    async def run(self, user_id: str, session_id: str, content: types.Content, debug: bool = False) -> Dict[str, Any]:
        """
        Run the explainer agent with error handling
        """
        try:
            async for event in self.runner.run_async(
                    user_id=user_id,
                    session_id=session_id,
                    new_message=content
            ):
                if debug:
                    print(f"[ExplainerAgent] Author: {event.author}, Type: {type(event).__name__}, "
                          f"Final: {event.is_final_response()}")

                if event.is_final_response():
                    if event.content and event.content.parts:
                        return {
                            "status": "success",
                            "explanation": event.content.parts[0].text
                        }
                    elif event.actions and event.actions.escalate:
                        return {
                            "status": "error",
                            "message": f"Explainer agent escalated: {event.error_message or 'No specific message.'}"
                        }
            
            return {
                "status": "error",
                "message": "Explainer agent did not give a final response",
            }
        except Exception as e:
            print(f"ExplainerAgent unexpected error: {e}")
            return {
                "status": "error",
                "message": f"Explainer agent error: {str(e)}"
            }