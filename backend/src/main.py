from fastapi import FastAPI, Depends, HTTPException, status, APIRouter, Request # Ensure Request is imported
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import secrets # Added for generating random passwords/suffixes

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
    if not user: # This check should come first
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not getattr(user, 'is_active', False): # Use getattr for safety, though direct access should work
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    
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
from .config import settings
from .models.db_user import User as UserModel

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
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not found in Google user info."
        )
        
    name = user_info.get("name")
    picture_url = user_info.get("picture")

    db_user = db.query(UserModel).filter(UserModel.email == email).first()

    if not db_user:
        # Create a new user
        # Determine initial username from name or email prefix
        if name:
            # Simple conversion: lowercase, replace spaces with dots, take first 40 chars
            base_username = name.lower().replace(" ", ".")[:40]
        else:
            base_username = email.split("@")[0][:40]

        # Ensure username uniqueness
        username_candidate = base_username
        # Limit username length to fit DB schema (String(50))
        # Max length for base_username part to allow for suffix like ".abc123" (7 chars)
        max_len_for_base_with_suffix = 50 - 8 
        
        # Ensure base_username is not too long if we need to add a suffix
        if len(username_candidate) > max_len_for_base_with_suffix:
            username_candidate = username_candidate[:max_len_for_base_with_suffix]

        final_username = username_candidate
        # Check for collision and append suffix if needed
        while db.query(UserModel).filter(UserModel.username == final_username).first():
            suffix = secrets.token_hex(3) # 6-character hex string
            final_username = f"{username_candidate}.{suffix}" 
            # Ensure the generated username does not exceed 50 chars
            if len(final_username) > 50:
                # If it's too long even with suffix, truncate the base part more aggressively
                # This is a fallback, ideally the initial truncation is enough
                base_part_len = 50 - len(suffix) - 1 # -1 for the dot
                final_username = f"{username_candidate[:base_part_len]}.{suffix}"


        random_password = secrets.token_urlsafe(16)
        hashed_password = auth.get_password_hash(random_password)
        
        db_user = UserModel(
            email=email,
            username=final_username,
            hashed_password=hashed_password,
            profile_image_base64=picture_url, # Storing URL in this field
            is_active=True,
            is_admin=False 
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    
    if not getattr(db_user, 'is_active', False): # Use getattr for safety
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="User is inactive."
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.username, "user_id": db_user.id, "is_admin": db_user.is_admin, "email": db_user.email},
        expires_delta=access_token_expires,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
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


