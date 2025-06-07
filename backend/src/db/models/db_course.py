import enum
from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ...db.database import Base
from . import db_user as user_model


class CourseStatus(enum.Enum):
    CREATING = "creating"
    UPDATING = "updating"
    FINISHED = "finished"
    FAILED = "failed"


class Course(Base):
    """Main course table containing all course information."""
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    total_time_hours = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status = Column(Enum(CourseStatus), nullable=False, default=CourseStatus.CREATING)

    # Relationships
    chapters = relationship("Chapter", back_populates="course", cascade="all, delete-orphan")
    documents = relationship("Document", foreign_keys="Document.course_id", cascade="all, delete-orphan")
    images = relationship("Image", foreign_keys="Image.course_id", cascade="all, delete-orphan")


class Chapter(Base):
    """Chapter table containing individual course sections."""
    __tablename__ = "chapters"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    index = Column(Integer, nullable=False)
    caption = Column(String(300), nullable=False)
    summary = Column(Text)
    content = Column(Text, nullable=False)
    time_minutes = Column(Integer, nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    course = relationship("Course", back_populates="chapters")
    mc_questions = relationship("MultipleChoiceQuestion", back_populates="chapter", cascade="all, delete-orphan")


class MultipleChoiceQuestion(Base):
    """Multiple choice questions for each chapter."""
    __tablename__ = "multiple_choice_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer_a = Column(String(500), nullable=False)
    answer_b = Column(String(500), nullable=False)
    answer_c = Column(String(500), nullable=False)
    answer_d = Column(String(500), nullable=False)
    correct_answer = Column(String(1), nullable=False)  # 'a', 'b', 'c', or 'd'
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    chapter = relationship("Chapter", back_populates="mc_questions")