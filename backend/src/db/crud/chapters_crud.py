from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models.db_course import Chapter





############### CHAPTERS
def get_chapter_by_id(db: Session, chapter_id: int) -> Optional[Chapter]:
    """Get chapter by ID"""
    return db.query(Chapter).filter(Chapter.id == chapter_id).first()


def get_chapters_by_course_id(db: Session, course_id: int) -> List[Chapter]:
    """Get all chapters for a specific course, ordered by index"""
    return db.query(Chapter).filter(Chapter.course_id == course_id).order_by(Chapter.index).all()


def get_chapter_by_course_and_index(db: Session, course_id: int, index: int) -> Optional[Chapter]:
    """Get specific chapter by course ID and chapter index"""
    return db.query(Chapter).filter(
        and_(Chapter.course_id == course_id, Chapter.index == index)
    ).first()


def create_chapter(db: Session, course_id: int, index: int, caption: str,
                   summary: str, content: str, time_minutes: int, image_url: Optional[str] = None) -> Chapter:
    """Create a new chapter"""
    db_chapter = Chapter(
        course_id=course_id,
        index=index,
        caption=caption,
        summary=summary,
        content=content,
        time_minutes=time_minutes,
        is_completed=False,
        image_url=image_url
    )
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


def update_chapter(db: Session, chapter_id: int, **kwargs) -> Optional[Chapter]:
    """Update chapter with provided fields"""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if chapter:
        for key, value in kwargs.items():
            if hasattr(chapter, key):
                setattr(chapter, key, value)
        db.commit()
        db.refresh(chapter)
    return chapter


def mark_chapter_complete(db: Session, chapter_id: int) -> Optional[Chapter]:
    """Mark chapter as completed"""
    return update_chapter(db, chapter_id, is_completed=True)


def mark_chapter_incomplete(db: Session, chapter_id: int) -> Optional[Chapter]:
    """Mark chapter as not completed"""
    return update_chapter(db, chapter_id, is_completed=False)


def delete_chapter(db: Session, chapter_id: int) -> bool:
    """Delete chapter by ID (cascades to questions)"""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if chapter:
        db.delete(chapter)
        db.commit()
        return True
    return False


def get_completed_chapters_by_course(db: Session, course_id: int) -> List[Chapter]:
    """Get all completed chapters for a course"""
    return db.query(Chapter).filter(
        and_(Chapter.course_id == course_id, Chapter.is_completed == True)
    ).order_by(Chapter.index).all()


def get_chapter_count_by_course(db: Session, course_id: int) -> int:
    """Get total number of chapters in a course"""
    return db.query(Chapter).filter(Chapter.course_id == course_id).count()


def search_chapters(db: Session, query: str, user_id: str, limit: int = 10) -> List[Chapter]:
    """
    Search for chapters where title or content contains the query string (case-insensitive).
    
    Args:
        db: Database session
        query: Search string
        limit: Maximum number of results to return
        
    Returns:
        List of matching Chapter objects
    """
    search = f"%{query}%"
    return (
        db.query(Chapter)
        .join(Chapter.course)  # Join with Course for access control
        .filter(
            (Chapter.user_id == user_id)
        )
        .filter(
            (Chapter.caption.ilike(search)) | 
        #   (Chapter.content.ilike(search)) |
            (Chapter.summary.ilike(search))
        )
        .limit(limit)
        .all()
    )

