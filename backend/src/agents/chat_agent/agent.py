"""
This is a small question-answer agent that functions like a standard gemini api call.
It is used for small requests like generating a course description.
It also handles session creation itself, which sets it apart from the other agents.
"""
import copy
import json
import os
from typing import Dict, Any, Optional

from google.adk.agents import LlmAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models import LlmResponse
from google.adk.runners import Runner
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters
from google.genai import types

from ..agent import StructuredAgent
from ..utils import load_instruction_from_file

from google.adk.sessions import DatabaseSessionService



class ChatAgent:
    app_name: str
    session_service: DatabaseSessionService 


    def __init__(self, app_name: str, session_service):
        # Call the base class constructor
        self.chat_agent = LlmAgent(
            name="chat_agent",
            model="gemini-1.5-flash-8b",
            description="Agent for creating a small chat for a course",
            instruction=load_instruction_from_file("chat_agent/instructions.txt"),
        )
        self.app_name = app_name
        self.session_service = session_service

        self.runner = Runner(
            agent=self.chat_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )



    async def run(self, user_id: str, chapter_id, state: dict, content: types.Content, debug: bool = False, max_retries: int = 1, retry_delay: float = 2.0) -> Dict[str, Any]:
        last_error = None
        
        for attempt in range(max_retries + 1):  # +1 for the initial attempt
            try:
                if debug:
                    print(f"[Debug] Running agent with state: {json.dumps(state, indent=2)}")

                # Create session
                session = await self.session_service.create_session(
                    app_name=self.app_name,
                    user_id=user_id,
                    session_id=str(chapter_id),
                    state=state
                )
                session_id = session.id

                # We iterate through events to find the final answer
                async for event in self.runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
                    if debug:
                        print(f"  [Event] Author: {event.author}, Type: {type(event).__name__}, Final: {event.is_final_response()}, Content: {event.content}")

                    # is_final_response() marks the concluding message for the turn
                    if event.is_final_response():
                        if event.content and event.content.parts:
                            # Assuming text response in the first part
                            return {
                                "status": "success",
                                "explanation": event.content.parts[0].text  # TODO rename to output/content
                            }
                        elif event.actions and event.actions.escalate:  # Handle potential errors/escalations
                            error_msg = f"Agent escalated: {event.error_message or 'No specific message.'}"
                            if attempt >= max_retries:
                                return {"status": "error", "message": error_msg}
                            last_error = error_msg
                            break  # Break out of event loop to trigger retry
                
                # If we get here, no final response was received
                error_msg = "Agent did not give a final response. Unknown error occurred."
                if attempt >= max_retries:
                    return {"status": "error", "message": error_msg}
                last_error = error_msg
                
            except Exception as e:
                if attempt >= max_retries:
                    raise  # Re-raise the exception if we've exhausted our retries
                last_error = str(e)
                if debug:
                    print(f"[RETRY] Attempt {attempt + 1} failed, retrying in {retry_delay} seconds... Error: {last_error}")
                
            # Only sleep if we're going to retry
            if attempt < max_retries:
                import asyncio
                await asyncio.sleep(retry_delay)
        
        # This should theoretically never be reached due to the raise/return above
        return {
            "status": "error",
            "message": f"Max retries exceeded. Last error: {last_error}",
        }


