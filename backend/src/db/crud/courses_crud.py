
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.db_course import Course, CourseStatus

############### COURSES
def get_course_by_id(db: Session, course_id: int) -> Optional[Course]:
    """Get course by ID"""
    return db.query(Course).filter(Course.id == course_id).first()


def get_course_by_session_id(db: Session, session_id: str) -> Optional[Course]:
    """Get course by session ID"""
    return db.query(Course).filter(Course.session_id == session_id).first()


def get_courses_by_user_id(db: Session, user_id: str) -> List[Course]:
    """Get all courses for a specific user"""
    return db.query(Course).filter(Course.user_id == user_id).all()


def get_courses_by_status(db: Session, status: CourseStatus) -> List[Course]:
    """Get all courses with a specific status"""
    return db.query(Course).filter(Course.status == status).all()


def create_new_course(db: Session, user_id: str, total_time_hours: int, query_: str,
                    status: CourseStatus = CourseStatus.CREATING) -> Course:
    """Create a new course"""
    db_course = Course(
        user_id=user_id,
        total_time_hours=total_time_hours,
        query=query_,
        status=status,
    )

    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


def update_course(db: Session, course_id: int, **kwargs) -> Optional[Course]:
    """Update course with provided fields"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if course:
        for key, value in kwargs.items():
            if hasattr(course, key):
                setattr(course, key, value)
        db.commit()
        db.refresh(course)
    return course


def update_course_status(db: Session, course_id: int, status: CourseStatus) -> Optional[Course]:
    """Update course status"""
    return update_course(db, course_id, status=status)


def delete_course(db: Session, course_id: int) -> bool:
    """Delete course by ID (cascades to chapters and questions)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if course:
        db.delete(course)
        db.commit()
        return True
    return False


def get_all_courses(db: Session) -> List[Course]:
    """Get all courses"""
    return db.query(Course).all()


def get_all_course_ids(db: Session) -> List[int]:
    """Get all course IDs"""
    return [course[0] for course in db.query(Course.id).all()]


def search_courses(db: Session, query: str, user_id: str, limit: int = 10) -> List[Course]:
    """
    Search for courses where title or description contains the query string (case-insensitive).
    
    Args:
        db: Database session
        query: Search string
        limit: Maximum number of results to return
        
    Returns:
        List of matching Course objects
    """
    search = f"%{query}%"
    return (
        db.query(Course)
        .filter(
            (Course.user_id == user_id)
        )
        .filter(
            (Course.title.ilike(search)) | (Course.description.ilike(search))
        )
        .limit(limit)
        .all()
    )
