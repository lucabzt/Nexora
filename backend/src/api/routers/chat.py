from fastapi import APIRouter, Depends, HTTPException
from ..schemas.chat import ChatRequest, ChatResponse
from ...utils.auth import get_current_active_user
from ...db.database import get_db
from sqlalchemy.orm import Session


from ...services.chat_service import generate_chat_response
from ...db.models.db_user import User


router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

@router.post("/{course_id}", response_model=ChatResponse)
def chat_with_agent(course_id: str,
                    chat_request: ChatRequest,
                    current_user: User = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):
    """
    Endpoint to chat with the agent for a specific course.
    """
    return generate_chat_response(
        db=db,
        course_id=int(course_id),
        current_user_id=str(current_user.id),
        chat_request=chat_request
    )
