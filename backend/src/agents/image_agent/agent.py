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

from src.agents.utils import create_text_query
from src.agents.agent import StandardAgent
from src.agents.utils import load_instruction_from_file
# REMOVED: No longer importing the local unsplash_tool
# from ..tools.unsplash_tool import unsplash_tool

class ImageAgent(StandardAgent):
    def __init__(self, app_name: str, session_service):
        
        # --- NEW: Setup for MCP Toolset ---
        # IMPORTANT: Replace this with the absolute path to your server script.
        # Using a template path as requested.
        path_to_mcp_server = "../tools/unsplash_mcp_server.py"

        # Create the toolset that will connect to your MCP server.
        # This will automatically start your unsplash_mcp_server.py as a subprocess.
        unsplash_mcp_toolset = MCPToolset(
            connection_params=StdioServerParameters(
                command='python3',  # The command to run your server
                args=[os.path.abspath(path_to_mcp_server)], # The argument is the path to the script
            )
        )
        # --- END NEW ---

        # Create the planner agent
        image_agent = LlmAgent(
            name="image_agent",
            model="gemini-2.0-flash", # Consider gemini-2.0-flash if available
            description="Agent for searching an image for a course using an external service.",
            instruction=load_instruction_from_file("image_agent/instructions.txt"),
            disallow_transfer_to_parent=True,
            disallow_transfer_to_peers=True,
            # UPDATED: Use the MCP toolset instead of the local tool
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
    await image_agent_instance.run(user_id="test", state={}, content=create_text_query("test"))
    print("done")

if __name__ == "__main__":
    asyncio.run(main())