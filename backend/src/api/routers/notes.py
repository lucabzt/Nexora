from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...db.models.db_note import Note
from ...db.models.db_user import User
from fastapi import status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

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
    def from_db_note(cls, db_note: Note):
        return cls(
            id=db_note.id,
            course_id=db_note.course_id,
            chapter_id=db_note.chapter_id,
            user_id=db_note.user_id,
            text=db_note.text,
            created_at=db_note.created_at.isoformat() if db_note.created_at else "",
            updated_at=db_note.updated_at.isoformat() if db_note.updated_at else None
        )

router = APIRouter(
    prefix="/notes",
    tags=["notes"]
)

@router.get("/", response_model=List[NoteOut])
def get_notes(courseId: int, chapterId: int, db: Session = Depends(get_db)):
    notes = db.query(Note).filter(Note.course_id == courseId, Note.chapter_id == chapterId).all()
    return [NoteOut.from_db_note(note) for note in notes]

@router.post("/", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def add_note(note: NoteCreate, db: Session = Depends(get_db)):
    # For now, use a dummy user_id (should be replaced with auth)
    db_note = Note(course_id=note.courseId, chapter_id=note.chapterId, user_id="dummy", text=note.text)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return NoteOut.from_db_note(db_note)

@router.put("/{note_id}", response_model=NoteOut)
def update_note(note_id: int, note: NoteUpdate, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db_note.text = note.text
    db.commit()
    db.refresh(db_note)
    return NoteOut.from_db_note(db_note)

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(db_note)
    db.commit()
    return None
