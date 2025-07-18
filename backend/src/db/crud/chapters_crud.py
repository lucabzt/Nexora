from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import and_
from sqlalchemy import text
from ..models.db_course import Chapter, Course





############### CHAPTERS
def get_chapter_by_id(db: Session, chapter_id: int) -> Optional[Chapter]:
    """Get chapter by ID"""
    return db.query(Chapter).filter(Chapter.id == chapter_id).first()

def get_chapter_by_course_id_and_chapter_id(db: Session, course_id: int, chapter_id: int) -> Optional[Chapter]:
    """Get chapter by course_id and ID. Unnecessary as chapters are unique per course."""
    return db.query(Chapter).filter(Chapter.id == chapter_id, Chapter.course_id == course_id).first()



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


def search_chapters_no_content(db: Session, query: str, user_id: str, limit: int = 10) -> List[Chapter]:
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
            (Course.user_id == user_id)
        )
        .filter(
            (Chapter.caption.ilike(search)) |
            #(Chapter.content.ilike(search)) |
            (Chapter.summary.ilike(search))
        )
        .limit(limit)
        .all()
    )

def search_chapters_indexed(db: Session, query: str, user_id: str, limit: int = 10):
    """
    Search for chapters using full-text search on indexed fields.
    Args:
        db: Database session
        query: Search string
        user_id: ID of the user to filter by
        limit: Maximum number of results to return
    Returns:
        List of matching Chapter objects
    """

    stmt = text("""
        SELECT 
            chapters.id, chapters.course_id, chapters.index, 
            chapters.caption, chapters.summary, chapters.content, 
            chapters.time_minutes, chapters.is_completed, 
            chapters.created_at, chapters.image_url
        FROM chapters
        JOIN courses ON courses.id = chapters.course_id
        WHERE courses.user_id = :user_id
        AND MATCH(chapters.caption, chapters.summary, chapters.content)
            AGAINST (:query IN NATURAL LANGUAGE MODE)
        LIMIT :limit
    """)

    results = db.execute(stmt, {"user_id": user_id, "query": query, "limit": limit})
    return [Chapter(**row._asdict()) for row in results]


def get_completed_chapters_count(db: Session, course_id: int) -> int:
    """Get total number of completed chapters in a course"""
    return db.query(Chapter).filter(
        and_(Chapter.course_id == course_id, Chapter.is_completed == True)
    ).count()
