"""
 Frontend
  ↓
API (FastAPI)
  ↓
→ MySQL: Verlauf lesen
→ Chroma: RAG-Wissen holen
  ↓
→ Prompt + Kontext an Agent SDK
  ↓
→ Agent entscheidet:
   ↳ Tool verwenden? → ja → Tool-Call + Ergebnis
   ↳ nein → Antwort direkt
  ↓
Antwort speichern + zurück an User
"""



import asyncio
from google.adk.agents import LlmAgent
from google.adk.sessions import InMemorySessionService, Session
from google.adk.memory import InMemoryMemoryService # Import MemoryService
from google.adk.runners import Runner
from google.adk.tools import load_memory # Tool to query memory
from google.genai.types import Content, Part

from sqlalchemy.orm import Session as SqlAlchemySession

from ..api.schemas.chat import ChatRequest, ChatResponse

from ..db.crud.chats import get_last_n_messages_by_course_id, save_chat_message
from ..db.models.db_chat import Chat

# --- Constants ---
APP_NAME = "memory_example_app"
USER_ID = "mem_user"
MODEL = "gemini-2.0-flash" # Use a valid model


# --- Agent Definitions ---
# Agent 1: Simple agent to capture information
info_capture_agent = LlmAgent(
    model=MODEL,
    name="InfoCaptureAgent",
    instruction="Acknowledge the user's statement.",
    # output_key="captured_info" # Could optionally save to state too
)

# Agent 2: Agent that can use memory
memory_recall_agent = LlmAgent(
    model=MODEL,
    name="MemoryRecallAgent",
    instruction="Answer the user's question. Use the 'load_memory' tool "
                "if the answer might be in past conversations.",
    tools=[load_memory] # Give the agent the tool
)

# --- Services and Runner ---
session_service = InMemorySessionService()
memory_service = InMemoryMemoryService() # Use in-memory for demo

runner = Runner(
    # Start with the info capture agent
    agent=info_capture_agent,
    app_name=APP_NAME,
    session_service=session_service,
    memory_service=memory_service # Provide the memory service to the Runner
)



def generate_chat_response(
    db: SqlAlchemySession,
    course_id: int,
    current_user_id: str,
    chat_request: ChatRequest
):
    """
    Generate a response for the chat request using the agent.
    """
    #session1 = await runner.session_service.create_session(app_name=APP_NAME, user_id=USER_ID, session_id=current_user_id)

    save_chat_message(
        db=db,
        chat=Chat(
            course_id = course_id,
            user_id = current_user_id,
            role="user",
            content=chat_request.message,
            images=chat_request.images or [],
        )
    )

    return ChatResponse(
        role="assistant",
        content="This is a placeholder response. The agent will generate the actual response.",
        timestamp=None  # You can set this to the current time if needed
    )