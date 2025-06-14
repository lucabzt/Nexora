
from sqlalchemy.orm import Session
from typing import List
from ..models.db_chat import Chat



def get_last_n_messages_by_course_id(db: Session, course_id: int, n: int = 10) -> List[Chat]:
    """Get the last n messages for a given course by its ID"""
    return db.query(Chat).filter(Chat.course_id == course_id).order_by(Chat.created_at.desc()).limit(n).all()

def save_chat_message(db: Session, chat: Chat) -> Chat:
    """Save a chat message to the database"""
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat