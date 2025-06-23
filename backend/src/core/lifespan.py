import asyncio
import atexit
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from ..core.routines import update_stuck_courses
from ..services.chat_service_instance import initialize as init_chat_service, close as close_chat_service

# Initialize scheduler
scheduler = AsyncIOScheduler()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle including startup and shutdown events."""
    # Startup
    logger.info("Starting application...")
    
    # Initialize scheduler
    scheduler.add_job(update_stuck_courses, 'interval', hours=1)
    scheduler.start()
    logger.info("Scheduler started.")
    
    # Initialize chat service
    try:
        await init_chat_service()
        logger.info("Chat service initialized.")
        
        # Register cleanup on exit
        atexit.register(lambda: asyncio.get_event_loop().run_until_complete(close_chat_service()))
        
        # Yield control to the application
        yield
        
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}", exc_info=True)
        raise
    finally:
        # Shutdown
        logger.info("Shutting down application...")
        
        # Shutdown scheduler
        if scheduler.running:
            scheduler.shutdown()
            logger.info("Scheduler stopped.")
        
        # Clean up chat service
        try:
            await close_chat_service()
            logger.info("Chat service stopped.")
        except Exception as e:
            logger.error(f"Error stopping chat service: {str(e)}", exc_info=True)
        
        logger.info("Application shutdown complete.")