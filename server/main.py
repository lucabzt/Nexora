import json
from typing import Optional

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from google.adk.sessions import InMemorySessionService

from server.agents.explainer_agent.agent import ExplainerAgent
from server.agents.planner_agent import PlannerAgent
from server.agents.tester_agent.agent import TesterAgent
from backend.src.agents.utils import create_text_query, create_doc_query

app = FastAPI()

# --- CORS Configuration (Development) ---
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- End CORS Configuration ---

load_dotenv()

APP_NAME = "TeachAI"
session_service = InMemorySessionService()

planner_agent = PlannerAgent(APP_NAME, session_service)
explainer_agent = ExplainerAgent(APP_NAME, session_service)
tester_agent = TesterAgent(APP_NAME, session_service)


@app.get("/")
def root():
    """ Default endpoint to check server reachability """
    return {"status": "running"}


@app.post("/create_session/{user_id}")
async def create_session(user_id: str):
    """ Get a new memory session for the given user id """
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        state={}
    )
    return {"session_id": session.id}


@app.post("/create_course/{user_id}/{session_id}")
async def create_course(
        user_id: str,
        session_id: str,
        query: str = Form(..., description="The text query from the user"),
        time: int = Form(..., description="The time the user wants to invest in hours"),
        file: Optional[UploadFile] = File(None, description="Optional document to extract content from")
):
    """
    Main endpoint for creating a new course from user query and documents.

    Args:
        user_id: User identifier
        session_id: Session identifier
        query: User's learning query/goal
        time: Time user wants to invest (in hours)
        file: Optional file to extract additional content from

    Returns:
        dict: Course structure with chapters and content
    """
    full_query = f"""
                Question (System): What do you want to learn?
                Answer (User): \n{query}
                Question (System): How many hours do you want to invest?
                Answer (User): {time}
            """

    if file:
        content = create_doc_query(full_query, file)
    else:
        content = create_text_query(full_query)

    # Query the planner agent (returns a dict)
    response_planner = await planner_agent.run(
        user_id=user_id,
        session_id=session_id,
        content=content,
        debug=False
    )

    response = {
        "status": "success",
        "chapters": []
    }

    # TODO add error handling for status: error
    # Enumerate chapters from planner agent and give to explainer and tester agent
    for idx, topic in enumerate(response_planner["chapters"]):
        # Create input to explainer agent
        pretty_topic = f"""
                Chapter {idx + 1}:
                Caption: {topic['caption']}
                Time in Minutes: {topic['time']}
                Content Summary: \n{json.dumps(topic['content'], indent=2)}
                Note by Planner Agent: {json.dumps(topic['note'], indent=2)}
            """

        # Get response from explainer agent
        response_explainer = await explainer_agent.run(
            user_id=user_id,
            session_id=session_id,
            content=create_text_query(pretty_topic),
        )

        # Create input to tester agent
        pretty_chapter = f"""
                {pretty_topic}
                Full Content: \n{json.dumps(response_explainer['explanation'], indent=2)}
        """

        # Get response from explainer agent
        response_tester = await tester_agent.run(
            user_id=user_id,
            session_id=session_id,
            content=create_text_query(pretty_chapter),
        )

        # Build up response
        chapter = {
            "index": idx + 1,
            "caption": topic['caption'],
            "summary": json.dumps(topic['content'], indent=2),
            "content": response_explainer['explanation'],
            "mc_questions": response_tester['questions'],
            "time": topic['time']
        }

        response["chapters"].append(chapter)

    return response


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)