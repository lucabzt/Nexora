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
from .routers import users,courses # Your existing users router

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
api_router.include_router(courses.router)

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
        data={"sub": user.username, "user_id": user.id, "is_admin": user.is_admin, "email": user.email}, # Added email
        expires_delta=access_token_expires,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "email": user.email, # Added email
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


from fastapi import APIRouter, Depends, HTTPException, status, Request
from authlib.integrations.starlette_client import OAuth, OAuthError
from ..config import settings
from ..models.db_user import User as UserModel

oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)


@api_router.get("/login/google")
async def login_google(request: Request):
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@api_router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f'Could not validate credentials: {error.error}',
            headers={"WWW-Authenticate": "Bearer"},
        ) from error
    
    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not fetch user info from Google."
        )

    email = user_info.get("email")
    # Optional: Get username from email or name
    username = user_info.get("name", email.split("@")[0])

    db_user = db.query(UserModel).filter(UserModel.email == email).first()

    if not db_user:
        # Create a new user if they don't exist
        # For simplicity, we're creating a user without a password. 
        # You might want to handle this differently, e.g., prompt for a password
        # or generate a random one and mark the account as needing password reset.
        new_user = UserModel(
            username=username, # Consider how to handle username conflicts if not using email
            email=email,
            hashed_password="", # No password for OAuth users, or handle differently
            is_active=True,
            # is_admin can be set based on your logic, default to False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        db_user = new_user
    
    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.username, "user_id": db_user.id, "is_admin": db_user.is_admin},
        expires_delta=access_token_expires,
    )
    
    # Redirect to frontend with token, or return token directly
    # This example returns the token directly, similar to the /token endpoint
    # You might want to redirect to a frontend URL with the token in a query parameter
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "username": db_user.username,
        "is_admin": db_user.is_admin
    }



@api_router.get("/users/me", response_model=user_schema.User, tags=["users"]) # Moved /users/me here
async def read_users_me(current_user: user_model.User = Depends(auth.get_current_active_user)):
    return current_user


# Include the api_router in the main app
app.include_router(api_router)


# The root path "/" is now outside the /api prefix
@app.get("/")
async def root():
    return {"message": "Welcome to the User Management API. API endpoints are under /api"}


