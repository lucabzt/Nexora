from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ...db.database import get_db
from ...db.models.db_user import User
from ...services import notes_service
from ...utils.auth import get_current_active_user
from ..schemas.notes import NoteOut, NoteCreate, NoteUpdate



router = APIRouter(
    prefix="/notes",
    tags=["notes"]
)

@router.get("/", response_model=List[NoteOut])
async def get_notes(
    courseId: int,
    chapterId: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve all notes for a specific course and chapter for the current user.
    """
    notes = notes_service.get_notes(
        db=db,
        course_id=courseId,
        chapter_id=chapterId,
        current_user=current_user
    )
    if not notes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No notes found for this course and chapter"
        )
    return [NoteOut.from_db_note(note) for note in notes]


@router.post("/", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def add_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new note for the current user.
    """
    db_note = notes_service.create_note(
        db=db,
        course_id=note.courseId,
        chapter_id=note.chapterId,
        text=note.text,
        current_user=current_user
    )
    return NoteOut.from_db_note(db_note)


@router.put("/{note_id}", response_model=NoteOut)
async def update_note(
    note_id: int,
    note: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing note's text.
    """
    db_note = notes_service.update_note(
        db=db,
        note_id=note_id,
        text=note.text,
        current_user=current_user
    )
    return NoteOut.from_db_note(db_note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a note.
    """
    notes_service.delete_note(
        db=db,
        note_id=note_id,
        current_user=current_user
    )
    return None
