"""Chat API endpoints for interacting with the AI chat agent."""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from pydantic import constr
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...db.models.db_user import User
from ...db.database import get_db_context

from ...utils.auth import get_current_active_user
from ..schemas.chat import ChatRequest, ChatResponse
from ...services.chat_service import chat_service
from ...db.crud import chapters_crud

logger = logging.getLogger(__name__)

# Maximum message length to prevent abuse
MAX_MESSAGE_LENGTH = 2000

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={
        404: {"description": "Not found"},
        429: {"description": "Too Many Requests"},
        500: {"description": "Internal Server Error"},
    },
)

def _validate_chat_request(chat_request: ChatRequest) -> None:
    """Validate the chat request parameters.
    
    Args:
        chat_request: The chat request to validate
        
    Raises:
        HTTPException: If validation fails
    """
    if not chat_request.message or not chat_request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )
    
    if len(chat_request.message) > MAX_MESSAGE_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Message too long. Max {MAX_MESSAGE_LENGTH} characters allowed."
        )


@router.post(
    "/{chapter_id}",
    response_model=None,
    responses={
        200: {
            "description": "Successful Response",
            "content": {"text/event-stream": {}}
        },
        400: {"description": "Bad Request - Invalid input"},
        401: {"description": "Unauthorized - Authentication required"},
        403: {"description": "Forbidden - Insufficient permissions"},
        429: {"description": "Too Many Requests - Rate limit exceeded"},
        500: {"description": "Internal Server Error"},
    }
)
async def chat_with_agent(
    chapter_id: int,
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_active_user)
) -> StreamingResponse:
    """Chat with the AI agent for a specific chapter.
    
    This endpoint allows users to send messages to the AI agent and receive
    streaming responses related to the specified chapter.
    
    Args:
        chapter_id: The ID of the chapter to chat about
        chat_request: The chat request containing the user's message
        current_user: The currently authenticated user
        
    Returns:
        StreamingResponse: Server-Sent Events stream with the AI's response
        
    Raises:
        HTTPException: If validation fails or an error occurs
    """
    try:
        with get_db_context() as db:
            chapter = chapters_crud.get_chapter_by_id(db, chapter_id)
            if not chapter:
                raise HTTPException(status_code=404, detail="Chapter not found")
            if not chapter.course.is_public and chapter.course.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="You do not have access to this chapter")

        # Validate the request
        _validate_chat_request(chat_request)
        
        # Log the chat request
        logger.info(
            "Chat request received",
            extra={
                "user_id": current_user.id,
                "chapter_id": chapter_id,
                "message_length": len(chat_request.message)
            }
        )
                
        # Process the chat message and return a streaming response
        return StreamingResponse(
            chat_service.process_chat_message(
                user_id=str(current_user.id),
                chapter_id=chapter_id,
                request=chat_request,
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except HTTPException as e:
        # Re-raise HTTP exceptions (like validation errors)
        raise e
    except Exception as e:
        # Log unexpected errors
        logger.error(
            "Unexpected error in chat_with_agent",
            exc_info=True,
            extra={
                "user_id": getattr(current_user, 'id', None),
                "chapter_id": chapter_id,
                "error": str(e)
            }
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing your request"
        ) from e
