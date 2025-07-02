"""
Chat service for handling chat interactions with AI agents.

This service coordinates the interaction between the API and the chat agent,
handling message processing, streaming responses, and error handling.
"""
import asyncio
import json
import logging
from typing import AsyncGenerator, Optional

from fastapi import HTTPException
from google.adk.sessions import DatabaseSessionService
from google.genai import types
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from ..config import settings
from ..agents.chat_agent.agent import ChatAgent
from ..agents.utils import create_text_query
from ..api.schemas.chat import ChatRequest
from ..config.settings import SQLALCHEMY_DATABASE_URL
from ..db.database import get_db_context

from ..db.crud import chapters_crud
from ..db.crud import usage_crud


logger = logging.getLogger(__name__)

class ChatService:
    """Service for handling chat interactions with AI agents."""
    
    def __init__(self):
        """Initialize the chat service with required components.
        
        Sets up database connection pooling and initializes the chat agent.
        """
        # Initialize the session service with just the database URL
        # The ADK will create its own engine internally
        self.session_service = DatabaseSessionService(
            db_url=SQLALCHEMY_DATABASE_URL,
            pool_recycle=settings.DB_POOL_RECYCLE,
            pool_pre_ping=settings.DB_POOL_PRE_PING,
            pool_size=settings.DB_POOL_SIZE,
            max_overflow=settings.DB_MAX_OVERFLOW
        )
        self.chat_agent = ChatAgent("Nexora", self.session_service)

   
    async def process_chat_message(
        self, 
        user_id: str, 
        chapter_id: int, 
        request: ChatRequest
    ) -> AsyncGenerator[str, None]:
        """Process a chat message and stream the response.
        
        Args:
            user_id: The ID of the user sending the message
            chapter_id: The ID of the chapter the chat is related to
            request: The chat request containing the message
            db: Database session
            
        Yields:
            str: Server-Sent Events formatted response chunks
            
        Raises:
            HTTPException: If there's an error processing the message
        """
        
        try:
            # Log the incoming request
            logger.info(
                "Processing chat message",
                extra={
                    "user_id": user_id,
                    "chapter_id": chapter_id,
                    "message_length": len(request.message)
                }
            )

            # Get chapter content for the agent state
            chapter_content = None
            with get_db_context() as db:
                chapter = chapters_crud.get_chapter_by_id(db, chapter_id)
                if not chapter:
                    raise HTTPException(status_code=404, detail="Chapter not found")
                
                chapter_content = chapter.content
            
                # Log the chat usage
                usage_crud.log_chat_usage(
                    db=db,
                    user_id=user_id,
                    message=request.message,
                    course_id=chapter.course_id,
                    chapter_id=chapter_id
                )
                logger.info(
                    "Logged chat usage",
                    extra={
                        "user_id": user_id,
                        "chapter_id": chapter_id,
                        "message_length": len(request.message)
                    }
                )
            
            # Process the message through the chat agent and stream responses
            try:
                async for text_chunk, is_final in self.chat_agent.run(
                    user_id=user_id,
                    state={"chapter_content": chapter_content},
                    chapter_id=chapter_id,
                    content=create_text_query(request.message),
                    debug=logger.isEnabledFor(logging.DEBUG)
                ):
                    # Skip empty chunks
                    if not text_chunk:
                        continue

                    if logger.isEnabledFor(logging.DEBUG):
                        logger.debug(f"Text chunk: {text_chunk}")

                    # If this is the final chunk, send a [DONE] event
                    if is_final:
                        yield "data: [DONE]\n\n"
                        return
                    else:
                        # Format as SSE data (double newline indicates end of message)
                        yield f"data: {json.dumps({'content': text_chunk})}\n\n"
      
            except Exception as e:
                logger.error(f"Error in chat stream: {str(e)}", exc_info=True)
                error_msg = json.dumps({"error": "An error occurred while processing your message"})
                yield f"event: error\ndata: {error_msg}\n\n"
                raise HTTPException(status_code=500, detail="Error processing chat message")
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                "Unexpected error processing chat message",
                exc_info=True,
                extra={
                    "user_id": user_id,
                    "chapter_id": chapter_id,
                    "error": str(e)
                }
            )
            # Send an error message as an SSE event
            error_msg = json.dumps({"error": "An error occurred while processing your message"})
            yield f"event: error\ndata: {error_msg}\n\n"
            # Re-raise the exception to be handled by the endpoint
            raise HTTPException(
                status_code=500,
                detail="An error occurred while processing your message"
            ) from e
        


chat_service = ChatService()
