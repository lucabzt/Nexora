"""
This is a small question-answer agent that functions like a standard gemini api call.
It is used for small requests like generating a course description.
It also handles session creation itself, which sets it apart from the other agents.
"""
import json
import os
import asyncio
from typing import Dict, Any

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters
from google.adk.sessions import InMemorySessionService

from ..callbacks import get_url_from_response
from ..utils import create_text_query, load_instruction_from_file
from ..agent import StandardAgent, StructuredAgent


class ImageAgent(StandardAgent):
    def __init__(self, app_name: str, session_service):
        # Have to do this outside of the image agent as image_agent sometimes will be used as a subagent
        path_to_mcp_server = os.path.join(os.path.dirname(__file__), "../tools/unsplash_mcp_server.py")

        # Define toolset for unsplash mcp server
        unsplash_mcp_toolset = MCPToolset(
            connection_params=StdioServerParameters(
                command='uv',
                args=[
                    "run",
                    "--with",
                    "fastmcp",
                    "fastmcp",
                    "run",
                    path_to_mcp_server  # You'll need the actual path to server.py
                ],
                env={
                    **os.environ
                }
            )
        )

        # Create the image agent
        image_agent = LlmAgent(
            name="image_agent",
            model="gemini-2.5-flash-lite-preview-06-17",
            description="Agent for searching an image for a course using an external service.",
            instruction=load_instruction_from_file("image_agent/instructions.txt"),
            tools=[unsplash_mcp_toolset],
            after_model_callback=get_url_from_response
        )

        # Create necessary
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=image_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )


async def main():
    print("Starting ImageAgent")
    # Renamed variable for clarity, as 'image_agent' is used inside __init__ for LlmAgent
    image_agent_instance = ImageAgent(app_name="Nexora", session_service=InMemorySessionService())
    response = await image_agent_instance.run(user_id="test", state={}, content=create_text_query("ein vector-bild zum thema branch and bound algorithmus"))
    print(response)
    print("done")

if __name__ == "__main__":
    asyncio.run(main())