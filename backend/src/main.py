from fastapi import FastAPI  # Ensure Request is imported
from fastapi.responses import RedirectResponse # Add this
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import secrets # Added for generating random passwords/suffixes
import uuid
import requests # Add requests for fetching image
import base64 # Add base64 for encoding image

from .api.schemas import user as user_schema
from .db.models import db_user as user_model
from .api.schemas import token as token_schema

from .utils import auth
from .db.database import engine, get_db
from .api.routers import users, files # Your existing users router
from .api.routers import courses
from .api.routers import auth as auth_router

from fastapi import APIRouter, Depends, HTTPException, status, Request
from .config import settings
from .db.models.db_user import User as UserModel


# Create database tables
user_model.Base.metadata.create_all(bind=engine)

# Create the main app instance
app = FastAPI(title="User Management API", root_path="/api")

# Add SessionMiddleware - THIS MUST BE ADDED
# Generate a random secret key for session middleware (ensure this is consistent if you have multiple instances or restart often, consider moving to settings)
# For production, you'd want to set this from an environment variable or a config file.
SESSION_SECRET_KEY = secrets.token_hex(32)
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
@app.get("/users/me", response_model=user_schema.User, tags=["users"])
async def read_users_me(current_user: user_model.User = Depends(auth.get_current_active_user)):
    return current_user

# Include your existing routers under this api_router
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(files.router)
app.include_router(auth_router.api_router)


# The root path "/" is now outside the /api prefix
@app.get("/")
async def root():
    return {"message": "Welcome to the User Management API. API endpoints are under /api"}
