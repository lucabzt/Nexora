"""
Chat service for handling chat interactions with AI agents.

This service coordinates the interaction between the API and the chat agent,
handling message processing, streaming responses, and error handling.
"""
import json
import logging
from typing import AsyncGenerator

from fastapi import HTTPException
from google.adk.sessions import DatabaseSessionService
from google.genai import types
from sqlalchemy.orm import Session

from ..agents.chat_agent.agent import ChatAgent
from ..agents.utils import create_text_query
from ..api.schemas.chat import ChatRequest
from ..config.settings import SQLALCHEMY_DATABASE_URL

from ..db.crud import chapters_crud

logger = logging.getLogger(__name__)

class ChatService:
    """Service for handling chat interactions with AI agents."""
    
    def __init__(self):
        """Initialize the chat service with required components."""
        self.session_service = DatabaseSessionService(db_url=SQLALCHEMY_DATABASE_URL)
        self.chat_agent = ChatAgent("Nexora", self.session_service)
   
    async def process_chat_message(
        self, 
        user_id: str, 
        chapter_id: str, 
        request: ChatRequest, 
        db: Session
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
            
            # Process the message through the chat agent and stream responses
            try:
                # Get chapter content for the agent state
                chapter_content = chapters_crud.get_chapter_by_id(db, chapter_id).content
                
                # Process the message and stream responses
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

                    logger.info(f"Text chunk: {text_chunk}")

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
            
        except Exception as e:
            logger.error(
                "Error processing chat message",
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
