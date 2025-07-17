import enum
from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, ForeignKey, Enum, Index
from sqlalchemy.dialects.mysql import LONGBLOB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ...db.database import Base
from . import db_user as user_model
from typing import List
from pydantic import Field

class CourseStatus(enum.Enum):
    CREATING = "creating"
    UPDATING = "updating"
    FINISHED = "finished"
    FAILED = "failed"


class Course(Base):
    """Main course table containing all course information."""
    __tablename__ = "courses"

    # Primary key and auto-incrementing ID
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Attributes from request
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    query = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status = Column(Enum(CourseStatus), nullable=False, default=CourseStatus.CREATING)
    total_time_hours = Column(Integer, nullable=False)
    language = Column(String(50), nullable=False)
    difficulty = Column(String(50), nullable=False)

    # Attributes filled by the agent
    session_id = Column(String(50), unique=True, index=True, nullable=True)
    title = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(2000), nullable=True)
    chapter_count = Column(Integer, nullable=True)
    error_msg = Column(Text, nullable=True)

    is_public = Column(Boolean, default=False)

    # Relationships
    chapters = relationship("Chapter", back_populates="course", cascade="all, delete-orphan")
    user = relationship("User", back_populates="courses")
    documents = relationship("Document", foreign_keys="Document.course_id", cascade="all, delete-orphan")
    images = relationship("Image", foreign_keys="Image.course_id", cascade="all, delete-orphan")


class Chapter(Base):
    """Chapter table containing individual course sections."""
    __tablename__ = "chapters"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)

    index = Column(Integer, nullable=False)
    caption = Column(String(300), nullable=False)
    summary = Column(Text)
    content = Column(Text, nullable=False)
    time_minutes = Column(Integer, nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    image_url = Column(Text, nullable=False)

    # Relationships
    course = relationship("Course", back_populates="chapters")
    questions = relationship("PracticeQuestion", back_populates="chapter", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="chapter", cascade="all, delete-orphan")

    # This makes ordering chapters by their index for a given course very fast.
    __table_args__ = (
        Index('ix_chapter_course_id_index', 'course_id', 'index'),
        Index('ix_chapter_fulltext', 'caption', 'summary', 'content', mysql_prefix='FULLTEXT'),
    )


class PracticeQuestion(Base):
    """Practice Questions for each chapter."""
    __tablename__ = "practice_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    type = Column(String(5), nullable=False)
    question = Column(Text, nullable=False)
    answer_a = Column(String(500), nullable=True)
    answer_b = Column(String(500), nullable=True)
    answer_c = Column(String(500), nullable=True)
    answer_d = Column(String(500), nullable=True)
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    users_answer = Column(Text, nullable=True)
    points_received = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    chapter = relationship("Chapter", back_populates="questions")