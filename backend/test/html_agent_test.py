from google.adk.sessions import InMemorySessionService

from backend.src.agents.html_agent.agent import HtmlAgent
from backend.src.agents.utils import create_text_query

prompt = """
    Game Theory Basics
[ "Define game theory and its applications", "Introduce the concept of a game, players, and strategies", "Explain different types of games: cooperative vs. non-cooperative, symmetric vs. asymmetric, zero-sum vs. non-zero-sum", "Illustrate with examples like the Prisoner's Dilemma and Rock-Paper-Scissors" ]
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

    if response:
        # Use json.dumps to correctly handle escapes, then strip the outer quotes
        # Or just replace the newline escapes if you know that's the main issue
        clean_html_string = response['explanation'].replace('\\n', '\n').replace('\\"', '"')
        print(clean_html_string)
        print("-" * 30)

    print(response)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())


