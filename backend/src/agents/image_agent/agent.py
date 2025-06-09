"""
This is a small question-answer agent that functions like a standard gemini api call.
It is used for small requests like generating a course description.
It also handles session creation itself, which sets it apart from the other agents.
"""
import os
import asyncio
from typing import Dict, Any

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
# NEW: Import MCPToolset and StdioServerParameters
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters
from google.adk.sessions import InMemorySessionService
from google.genai import types

from backend.src.agents.utils import create_text_query, load_instruction_from_file
from backend.src.agents.agent import StandardAgent

class ImageAgent(StandardAgent):
    def __init__(self, app_name: str, session_service):
        path_to_mcp_server = "../tools/unsplash_mcp_server.py"

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
        # Create the planner agent
        image_agent = LlmAgent(
            name="image_agent",
            model="gemini-2.0-flash",
            description="Agent for searching an image for a course using an external service.",
            instruction=load_instruction_from_file("image_agent/instructions.txt"),
            tools=[unsplash_mcp_toolset]
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
    response = await image_agent_instance.run(user_id="test", state={}, content=create_text_query("ein bild mit bergen"))
    print(response)
    print("done")

if __name__ == "__main__":
    asyncio.run(main())