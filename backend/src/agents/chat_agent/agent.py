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
from google.adk.runners import RunConfig
from google.adk.agents.run_config import StreamingMode


class ChatAgent:
    app_name: str
    session_service: DatabaseSessionService 


    def __init__(self, app_name: str, session_service: DatabaseSessionService):
        # Call the base class constructor
        self.chat_agent = LlmAgent(
            name="chat_agent",
            model="gemini-2.5-flash-preview-05-20",
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


    async def run(self, user_id: str, chapter_id, state: dict, content: types.Content, debug: bool = False, max_retries: int = 1, retry_delay: float = 2.0):
        """Run the chat agent with retry logic and streaming support.
        
        Args:
            user_id: The ID of the user
            chapter_id: The ID of the chapter
            state: The state to initialize the session with
            content: The content to process
            debug: Whether to enable debug logging
            max_retries: Maximum number of retry attempts
            retry_delay: Delay between retries in seconds
            
        Yields:
            tuple: (text: str, is_final: bool) - The text content and whether it's the final response
        """
        last_error = None
        for attempt in range(1, max_retries + 1):
            try:
                # Get or create a session for this user and chapter
                session = await self.session_service.get_session(
                    app_name=self.app_name,
                    user_id=user_id,
                    session_id=str(chapter_id)
                )
                
                if not session:
                    session = await self.session_service.create_session(
                        app_name=self.app_name,
                        user_id=user_id,
                        session_id=str(chapter_id),
                        state=state or {}
                    )
                
                # We iterate through events and yield them as they come in
                async for event in self.runner.run_async(
                    user_id=user_id,
                    session_id=session.id,
                    new_message=content,
                    run_config=RunConfig(streaming_mode=StreamingMode.SSE)
                ):
                    if debug:
                        print(f"  [Event] Author: {event.author}, Type: {type(event).__name__}, Final: {event.is_final_response()}, Content: {event.content}")

                    # Check for text content in the event
                    if event.content and event.content.parts:
                        # Yield each text part
                        for part in event.content.parts:
                            if hasattr(part, 'text') and part.text:
                                yield part.text, event.is_final_response()
                    
                    # Handle final response or errors
                    if event.is_final_response():
                        if event.actions and event.actions.escalate:
                            error_msg = f"Agent escalated: {event.error_message or 'No specific message.'}"
                            if attempt >= max_retries:
                                raise Exception(error_msg)
                            last_error = error_msg
                            break
                        return  # Successfully completed
                
                # If we get here, no final response was received
                error_msg = "Agent did not give a final response. Unknown error occurred."
                if attempt >= max_retries:
                    raise Exception(error_msg)
                last_error = error_msg
                
            except Exception as e:
                if attempt >= max_retries:
                    # Yield the error as a final message
                    yield f"Error: {str(e)}", True
                    return
                last_error = str(e)
                if debug:
                    print(f"[RETRY] Attempt {attempt} failed, retrying in {retry_delay} seconds... Error: {last_error}")
                
                # Only sleep if we're going to retry
                if attempt < max_retries:
                    import asyncio
                    await asyncio.sleep(retry_delay)
        
        # If we've exhausted all retries
        error_msg = f"Max retries exceeded. Last error: {last_error}"
        yield error_msg, True
