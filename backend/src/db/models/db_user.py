from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime # Added Text and DateTime
from datetime import datetime, timezone
from ..database import Base
from sqlalchemy.dialects.mysql import LONGTEXT



class User(Base):
    __tablename__ = "users"
    id = Column(String(50), primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(100), nullable=False) # Später true, oaut = NULL
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False) # Added for admin role
    #später hier oauth accs erkennen: open_id = Column(String(50), unique=True, index=True, nullable=True) # New field for OpenID
    profile_image_base64 = Column(LONGTEXT, nullable=True) # New field for profile image
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=True)
    last_login = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=True) # Will be updated manually on login