
from ..db.crud import courses_crud
from ..db.models import db_course as course_model
from ..api.schemas.course import CourseInfo
from typing import List
from sqlalchemy.orm import Session

from ..db.models.db_course import Course

from ..db.crud import chapters_crud

from fastapi import HTTPException, status
from typing import Optional
from ..db.models.db_course import Chapter

def get_user_courses(db: Session, user_id: str, skip: int = 0, limit: int = 200) -> List[CourseInfo]:
    return courses_crud.get_courses_infos(db, user_id, skip, limit)


def get_completed_chapters_count(db: Session, course_id: int) -> int:
    return chapters_crud.get_completed_chapters_count(db, course_id)


def get_course_by_id(db: Session, course_id: int, user_id: str) -> Optional[Course]:
    return courses_crud.get_courses_by_course_id_user_id(db, course_id, user_id)


async def verify_course_ownership(course_id: int, user_id: str, db: Session) -> Course:
    """
    Verify that a course belongs to the current user.
    Returns the course if valid, raises HTTPException if not found or unauthorized.
    """
    course = get_course_by_id(db, course_id, user_id)
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or access denied"
        )
    
    return course

def get_chapter_by_id(course_id: int, chapter_id: int, db: Session) -> Chapter:
    chapter = (db.query(Chapter)
              .filter(Chapter.id == chapter_id, Chapter.course_id == course_id)
              .first())
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found in this course"
        )

    return chapter


