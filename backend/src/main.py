import secrets
from typing import Optional  # Added for generating random passwords/suffixes
from logging import getLogger
import logging

from fastapi import FastAPI  # Ensure Request is imported
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from .api.routers import auth as auth_router
from .api.routers import courses, files, users, statistics, questions  # Your existing users router
from .api.routers import notes
#from .api.routers import notifications
from .api.routers import search as search_router
from .api.schemas import user as user_schema
from .db.database import engine
from .db.models import db_user as user_model
from .utils import auth

from .core.routines import update_stuck_courses
from .config.settings import SESSION_SECRET_KEY  # Ensure this is imported from your settings


# Create database tables
user_model.Base.metadata.create_all(bind=engine)

# Create the main app instance
app = FastAPI(title="User Management API", root_path="/api")

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

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager
scheduler = AsyncIOScheduler()

import logging



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler.add_job(update_stuck_courses, 'interval', hours=1)
    scheduler.start()
    logging.info("Scheduler started.")
    yield
    # Shutdown
    scheduler.shutdown()
    logging.info("Scheduler stopped.")

app.router.lifespan_context = lifespan

# The root path "/" is now outside the /api prefix
@app.get("/")
async def root():
    """Status endpoint for the API."""
    return {"message": "Welcome to the User Management API. API endpoints are under /api"}
