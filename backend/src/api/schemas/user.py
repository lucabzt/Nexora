# app/schemas.py
from pydantic import BaseModel, EmailStr, Field, field_validator # Make sure field_validator is imported
from typing import Optional, List
from datetime import datetime
import re
from ...config.settings import MIN_PASSWORD_LENGTH, REQUIRE_UPPERCASE, REQUIRE_LOWERCASE, REQUIRE_DIGIT, REQUIRE_SPECIAL_CHAR, SPECIAL_CHARACTERS_REGEX_PATTERN # Make sure SPECIAL_CHARACTERS_REGEX_PATTERN is imported

class UserBase(BaseModel):
    """Base model for user data, used for both creation and updates."""
    username: str
    email: EmailStr
    profile_image_base64: Optional[str] = None # Added for profile image

class UserCreate(UserBase):
    """Model for creating a new user."""
    password: str = Field(
        ..., # Ellipsis means the field is required
        # min_length=MIN_PASSWORD_LENGTH, # This will be implicitly checked by our validator too
        description=f"Password must be at least {MIN_PASSWORD_LENGTH} characters long and meet complexity requirements."
    )

    @field_validator('password')
    @classmethod
    def password_complexity_checks(cls, v: str) -> str:
        """Validate password complexity requirements."""
        # Pydantic's Field(min_length=...) would handle this,
        # but we include it here for a unified error message if preferred.
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters long.")

        errors: List[str] = []
        if REQUIRE_UPPERCASE and not re.search(r"[A-Z]", v):
            errors.append("must contain at least one uppercase letter")
        if REQUIRE_LOWERCASE and not re.search(r"[a-z]", v):
            errors.append("must contain at least one lowercase letter")
        if REQUIRE_DIGIT and not re.search(r"\d", v):
            errors.append("must contain at least one digit")
        if REQUIRE_SPECIAL_CHAR and not re.search(SPECIAL_CHARACTERS_REGEX_PATTERN, v):
            errors.append("must contain at least one special character (e.g., !@#$%)")
        
        if errors:
            # Pydantic expects a ValueError to be raised for validation failures
            # The message will be part of the 422 response detail.
            error_summary = "; ".join(errors)
            raise ValueError(f"Password does not meet complexity requirements: {error_summary}.")
        return v

class UserUpdate(BaseModel):
    """Model for updating an existing user."""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_image_base64: Optional[str] = None # Added for profile image
    password: Optional[str] = Field(
        default=None, # Password is optional on update
        description="New password (if changing) must meet complexity requirements."
    )
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None # Only updatable by admins

    @field_validator('password')
    @classmethod
    def update_password_complexity_checks(cls, v: Optional[str]) -> Optional[str]:
        """Validate new password complexity requirements."""
        if v is None: # If password is not being updated, skip validation
            return v
        
        # If password is provided (not None), it must meet all complexity rules.
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(f"New password must be at least {MIN_PASSWORD_LENGTH} characters long.")

        errors: List[str] = []
        if REQUIRE_UPPERCASE and not re.search(r"[A-Z]", v):
            errors.append("must contain at least one uppercase letter")
        if REQUIRE_LOWERCASE and not re.search(r"[a-z]", v):
            errors.append("must contain at least one lowercase letter")
        if REQUIRE_DIGIT and not re.search(r"\d", v):
            errors.append("must contain at least one digit")
        if REQUIRE_SPECIAL_CHAR and not re.search(SPECIAL_CHARACTERS_REGEX_PATTERN, v):
            errors.append("must contain at least one special character (e.g., !@#$%)")
        
        if errors:
            error_summary = "; ".join(errors)
            raise ValueError(f"New password does not meet complexity requirements: {error_summary}.")
        return v

      
class UserPasswordUpdate(BaseModel):
    """Model for updating a user's password."""
    old_password: Optional[str] = None # Required for non-admins
    new_password: str = Field(
        ...,
        description=f"New password must be at least {MIN_PASSWORD_LENGTH} characters long and meet complexity requirements."
    )

    @field_validator('new_password')
    @classmethod
    def password_complexity_checks(cls, v: str) -> str:
        """Validate new password complexity requirements."""
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(f'Password must be at least {MIN_PASSWORD_LENGTH} characters long')
        if REQUIRE_UPPERCASE and not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if REQUIRE_LOWERCASE and not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if REQUIRE_DIGIT and not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if REQUIRE_SPECIAL_CHAR and not re.search(SPECIAL_CHARACTERS_REGEX_PATTERN, v):
            raise ValueError('Password must contain at least one special character')
        return v


class User(UserBase):
    """Model representing a user in the system."""
    id: str
    is_active: bool
    is_admin: bool
    profile_image_base64: Optional[str] = None # Added for profile image
    created_at: datetime
    last_login: datetime
    login_streak: int
    total_learn_time: Optional[int] = None # Total time spent learning in Minutes

    class Config:
        from_attributes = True

