"""Module to hold the global chat service instance with proper initialization and cleanup."""
import asyncio
import atexit
import logging
from typing import Optional

from .chat_service import ChatService

logger = logging.getLogger(__name__)

# Global chat service instance
_chat_service: Optional[ChatService] = None
_initialized: bool = False


def get_chat_service() -> ChatService:
    """Get or create the global chat service instance.
    
    Returns:
        ChatService: The global chat service instance
    """
    global _chat_service, _initialized
    
    if _chat_service is None:
        _chat_service = ChatService()
        logger.info("Created new ChatService instance")
    
    # Initialize the service if not already done
    if not _initialized:
        logger.warning("ChatService accessed before initialization. Consider initializing at startup.")
    
    return _chat_service


async def initialize() -> None:
    """Initialize the chat service asynchronously."""
    global _initialized
    if not _initialized:
        service = get_chat_service()
        await service.initialize()
        _initialized = True
        logger.info("ChatService initialized")


async def close() -> None:
    """Clean up resources used by the chat service."""
    global _chat_service, _initialized
    
    if _chat_service is not None:
        await _chat_service.close()
        _chat_service = None
        _initialized = False
        logger.info("ChatService closed")


def _cleanup():
    """Synchronous cleanup function for atexit."""
    if _chat_service is not None:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(close())
        else:
            loop.run_until_complete(close())


# Register cleanup on exit
atexit.register(_cleanup)
