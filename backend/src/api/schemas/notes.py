from typing import Optional
from pydantic import BaseModel



class NoteCreate(BaseModel):
    courseId: int
    chapterId: int
    text: str


class NoteUpdate(BaseModel):
    text: str


class NoteOut(BaseModel):
    id: int
    course_id: int
    chapter_id: int
    user_id: str
    text: str
    created_at: str
    updated_at: Optional[str] = None
    
    @classmethod
    def from_db_note(cls, db_note):
        return cls(
            id=db_note.id,
            course_id=db_note.course_id,
            chapter_id=db_note.chapter_id,
            user_id=db_note.user_id,
            text=db_note.text,
            created_at=db_note.created_at.isoformat() if db_note.created_at else "",
            updated_at=db_note.updated_at.isoformat() if db_note.updated_at else None
        )
