from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime # Added Text and DateTime
from datetime import datetime, timezone
from ..database import Base
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import relationship



class Usage(Base):
    """Model for tracking user actions and interactions with the system."""
    __tablename__ = "usages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), nullable=False)
    course_id = Column(Integer, nullable=True)  # Nullable for global actions not tied to a specific course
    chapter_id = Column(Integer, nullable=True)  # Nullable for global actions not tied to a specific chapter
    action = Column(String(50), nullable=False)  # e.g., "view", "complete", "start", "create", "delete"
    details = Column(Text, nullable=True)  # Additional details about the action
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)