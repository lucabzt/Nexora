from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from ...db.database import Base




class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    role = Column(String(50), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    content = Column(Text, nullable=False)