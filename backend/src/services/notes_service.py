"""
Notes service for handling notes-related business logic.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..db.crud import notes_crud
from ..db.models.db_note import Note
from ..db.models.db_user import User


def get_notes(
    db: Session,
    course_id: int,
    chapter_id: int,
    current_user: User
) -> List[Note]:
    """
    Retrieve all notes for a specific chapter and user.
    Returns:
        List[Note]: List of notes for the specified chapter and user.
        Note is:
            id: int
            course_id: int
            chapter_id: int
            user_id: str
            text: str
            created_at: str
            updated_at: Optional[str] = None
    Raises:
        HTTPException: If no notes are found for the specified chapter and user.
    """
    return notes_crud.get_notes_by_chapter(
        db=db,
        course_id=course_id,
        chapter_id=chapter_id,
        user_id=current_user.id
    )


def create_note(
    db: Session,
    course_id: int,
    chapter_id: int,
    text: str,
    current_user: User
) -> Note:
    """
    Create a new note for the current user.
    Returns:
        Note: The created note.
        Note is:
            id: int
            course_id: int
            chapter_id: int
            user_id: str
            text: str
            created_at: str
            updated_at: Optional[str] = None
    Raises:
        HTTPException: If the note could not be created.
    """
    return notes_crud.create_note(
        db=db,
        course_id=course_id,
        chapter_id=chapter_id,
        user_id=current_user.id,
        text=text
    )


def update_note(
    db: Session,
    note_id: int,
    text: str,
    current_user: User
) -> Note:
    """
    Update an existing note's text if it belongs to the current user.
    Returns:
        Note: The updated note.
        Note is:
            id: int
            course_id: int
            chapter_id: int
            user_id: str
            text: str
            created_at: str
            updated_at: Optional[str] = None
    Raises:
        HTTPException: If the note could not be updated.
    """
    db_note = notes_crud.get_note_by_id(db, note_id=note_id)
    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    if str(db_note.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this note"
        )
    
    return notes_crud.update_note(
        db=db,
        db_note=db_note,
        text=text
    )


def delete_note(
    db: Session,
    note_id: int,
    current_user: User
) -> None:
    """
    Delete a note if it belongs to the current user.
    Returns:
        None
    Raises:
        HTTPException: If the note could not be deleted.
    """
    db_note = notes_crud.get_note_by_id(db, note_id=note_id)
    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    if str(db_note.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this note"
        )
    
    return notes_crud.delete_note(db=db, db_note=db_note)
