from fastapi import FastAPI, Depends, HTTPException, status, APIRouter # Import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from .schemas import user as user_schema
from .models import db_user as user_model
from .schemas import token as token_schema

from .utils import auth
from .db.database import engine, get_db
from .routers import users # Your existing users router

# Create database tables
user_model.Base.metadata.create_all(bind=engine)

# Create the main app instance
app = FastAPI(title="User Management API", root_path="/api")

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

# Create a root router for the /api prefix
api_router = APIRouter()

# Include your existing routers under this api_router
api_router.include_router(users.router)
# If you had other routers (e.g., items_router), you would include them here too:
# api_router.include_router(items_router, prefix="/items", tags=["items"])


# Define /token and /register directly under api_router if you want them prefixed
@api_router.post("/token", response_model=token_schema.Token, tags=["authentication"])
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "user_id": user.id, "is_admin": user.is_admin},
        expires_delta=access_token_expires,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "is_admin": user.is_admin
    }

@api_router.post("/register", response_model=user_schema.User, status_code=status.HTTP_201_CREATED, tags=["Authentication"]) # Corrected Tag
async def register_user(user_data: user_schema.UserCreate, db: Session = Depends(get_db)):
    # Check if username from incoming data (user_data.username) already exists in the DB
    db_user_by_username = db.query(user_model.User).filter(user_model.User.username == user_data.username).first()
    if db_user_by_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    
    # Check if email from incoming data (user_data.email) already exists in the DB
    db_user_by_email = db.query(user_model.User).filter(user_model.User.email == user_data.email).first()
    if db_user_by_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user_data.password)
    
    # Create an instance of the SQLAlchemy model (user_model.User)
    new_db_user = user_model.User( # Renamed from new_user for clarity
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        is_admin=False # Ensure new users are NOT admins by default
    )
    
    db.add(new_db_user)
    db.commit()
    db.refresh(new_db_user)
    
    return new_db_user

@api_router.get("/users/me", response_model=user_schema.User, tags=["users"]) # Moved /users/me here
async def read_users_me(current_user: user_model.User = Depends(auth.get_current_active_user)):
    return current_user


# Include the api_router in the main app
app.include_router(api_router)


# The root path "/" is now outside the /api prefix
@app.get("/")
async def root():
    return {"message": "Welcome to the User Management API. API endpoints are under /api"}