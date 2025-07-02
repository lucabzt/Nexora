
from ..db.crud import courses_crud
from ..db.models import db_course as course_model
from ..api.schemas.course import CourseInfo
from typing import List
from sqlalchemy.orm import Session

from ..db.models.db_course import Course

from fastapi import HTTPException, status
from typing import Optional
from ..db.models.db_course import Chapter

from ..db.crud import usage_crud, chapters_crud



def get_user_courses(db: Session, user_id: str, skip: int = 0, limit: int = 200) -> List[CourseInfo]:
    """
    Get a list of courses for a specific user.
    This function retrieves courses that belong to the user identified by user_id,
    with pagination support using skip and limit parameters.
    """
    return courses_crud.get_courses_infos(db, user_id, skip, limit)


def get_completed_chapters_count(db: Session, course_id: int) -> int:
    """
    Get the count of completed chapters for a specific course.
    This function retrieves the number of chapters that have been marked as completed
    for the given course ID.
    """
    return chapters_crud.get_completed_chapters_count(db, course_id)


def get_course_by_id(db: Session, course_id: int, user_id: str) -> Optional[Course]:
    """
    Get a course by its ID for a specific user.
    Returns None if the course does not exist or does not belong to the user.
    """
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
    """
    Get a chapter by its ID within a specific course.
    Raises HTTPException if the chapter does not exist in the course.
    """

    # Get the chapter by course_id and chapter_id
    chapter = chapters_crud.get_chapter_by_course_id_and_chapter_id(db, course_id, chapter_id)
    # Log the chapter retrieval
    usage_crud.log_chapter_open(db, user_id=str(course.user_id), course_id=course_id, chapter_id=chapter_id)
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found in this course"
        )

    return chapter



def log_chapter_close(
    db: Session,
    user_id: str,
    course_id: int,
    chapter_id: int
) -> None:
    """
    Log the closure of a chapter by a user.
    This function records the action of closing a chapter in the usage logs.
    """
    usage_crud.log_chapter_close(
        db=db,
        user_id=user_id,
        course_id=course_id,
        chapter_id=chapter_id
    )
