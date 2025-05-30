from google.adk.sessions import InMemorySessionService

from backend.src.agents.html_agent.agent import HtmlAgent
from backend.src.agents.utils import create_text_query

prompt = """
    "slide 1": ["an explanation of variables in python"], 
    "slide 2": ["a visual explanation of the taylor series"],
"""

async def main():
    session_service = InMemorySessionService()

    session = await session_service.create_session(
        app_name="html_agent",
        user_id="test_user",
        state={}
    )

    session_id = session.id

    agent = HtmlAgent(app_name="html_agent", session_service=session_service)

    response = await agent.run(
        user_id="test_user",
        session_id=session_id,
        content=create_text_query(prompt),
        debug=True
    )

    print(response)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())


