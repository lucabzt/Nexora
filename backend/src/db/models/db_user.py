from sqlalchemy import Boolean, Column, Integer, String, Text # Added Text
from backend.src.db.database import Base
from sqlalchemy.dialects.mysql import LONGTEXT



class User(Base):
    __tablename__ = "users"
    id = Column(String(50), primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False) # Added for admin role
    profile_image_base64 = Column(LONGTEXT, nullable=True) # New field for profile image