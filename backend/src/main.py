import asyncio
import atexit
import logging
import secrets
from typing import Optional

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session

from .api.routers import auth as auth_router
from .api.routers import courses, files, users, statistics, questions
from .api.routers import notes
#from .api.routers import notifications
from .api.routers import chat
from .api.routers import search as search_router
from .api.schemas import user as user_schema
from .db.database import engine, SessionLocal
from .db.models import db_user as user_model
from .utils import auth
from .services.chat_service import ChatService

from .core.routines import update_stuck_courses
from .config.settings import SESSION_SECRET_KEY


# Create database tables
user_model.Base.metadata.create_all(bind=engine)

# Create the main app instance
app = FastAPI(
    title="User Management API",
    root_path="/api",
    lifespan=lifespan  # Use the lifespan context manager
)

# Global chat service instance
chat_service = None

def get_chat_service() -> ChatService:
    """Dependency to get the chat service instance."""
    global chat_service
    if chat_service is None:
        chat_service = ChatService()
    return chat_service

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY
)


# CORS Configuration (remains the same)
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define /users/me BEFORE including users.router to ensure correct route matching
@app.get("/users/me", response_model=Optional[user_schema.User], tags=["users"])
async def read_users_me(current_user: Optional[user_model.User] = Depends(auth.get_current_user_optional)):
    """Get the current logged-in user's details."""
    return current_user

# Include your existing routers under this api_router
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(files.router)
app.include_router(search_router.router)  # Add search router
app.include_router(statistics.router)
app.include_router(auth_router.api_router)
app.include_router(notes.router)
#app.include_router(notifications.router)
app.include_router(questions.router)
app.include_router(chat.router)


from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager
scheduler = AsyncIOScheduler()

import logging



@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle including startup and shutdown events."""
    global chat_service
    
    # Startup
    logging.info("Starting application...")
    
    # Initialize scheduler
    scheduler.add_job(update_stuck_courses, 'interval', hours=1)
    scheduler.start()
    logging.info("Scheduler started.")
    
    # Initialize chat service
    try:
        chat_service = ChatService()
        await chat_service.initialize()
        logging.info("Chat service initialized.")
        
        # Register cleanup on exit
        def cleanup():
            """Synchronous cleanup function."""
            global chat_service
            if chat_service:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(chat_service.close())
                else:
                    loop.run_until_complete(chat_service.close())
                logging.info("Chat service cleaned up.")
        
        atexit.register(cleanup)
        
        # Yield control to the application
        yield
        
    except Exception as e:
        logging.error(f"Error during startup: {str(e)}", exc_info=True)
        raise
    finally:
        # Shutdown
        logging.info("Shutting down application...")
        
        # Shutdown scheduler
        if scheduler.running:
            scheduler.shutdown()
            logging.info("Scheduler stopped.")
        
        # Clean up chat service
        if chat_service:
            await chat_service.close()
            logging.info("Chat service stopped.")
        
        logging.info("Application shutdown complete.")

# The root path "/" is now outside the /api prefix
@app.get("/")
async def root():
    """Status endpoint for the API."""
    return {"message": "Welcome to the User Management API. API endpoints are under /api"}
