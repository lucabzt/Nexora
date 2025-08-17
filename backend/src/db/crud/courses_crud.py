
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ..models.db_course import Course, CourseStatus, Chapter
from typing import List
from ..models.db_course import Course, Chapter
from sqlalchemy.orm import Session
from sqlalchemy.sql import select, func as sql_func
from ...api.schemas.course import CourseInfo



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

def get_courses_by_course_id_user_id(db: Session, course_id: int, user_id: str) -> Optional[Course]:
    """Get all courses for a specific user"""
    return db.query(Course).filter(Course.user_id == user_id, Course.id == course_id).first()


def get_courses_by_status(db: Session, status: CourseStatus) -> List[Course]:
    """Get all courses with a specific status"""
    return db.query(Course).filter(Course.status == status).all()


def get_course_count_by_user_id(db: Session, user_id: str) -> int:
    """Get the count of courses for a specific user"""
    return db.query(Course).filter(Course.user_id == user_id).count()

def create_new_course(db: Session, user_id: str, total_time_hours: int, query_: str,
                      language: str = "en", difficulty: str = "advanced",
                      status: CourseStatus = CourseStatus.CREATING) -> Course:
    """Create a new course"""
    db_course = Course(
        user_id=user_id,
        total_time_hours=total_time_hours,
        query=query_,
        status=status,
        language=language,
        difficulty=difficulty
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


def update_course_public_status(db: Session, course_id: int, is_public: bool) -> Optional[Course]:
    """Update the public status of a course"""
    return update_course(db, course_id, is_public=is_public)


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



def get_public_courses_infos(db: Session, user_id: str, skip: int = 0, limit: int = 200) -> List[CourseInfo]:
    """Get course info by user ID with completed chapter count
    
    Args:
        db: Database session
        user_id: ID of the user to get courses for
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of CourseInfo objects containing course info with completed chapter count
    """
    
    # Eagerly load the related User object to get the username efficiently
    courses = (
        db.query(Course)
        .options(joinedload(Course.user))
        .filter(Course.is_public == True)
        .order_by(Course.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Convert to list of CourseInfo objects
    result = []
    for course in courses:
        course_info = CourseInfo(
            course_id=course.id,
            total_time_hours=course.total_time_hours,
            status=course.status.value,  # Convert enum to string
            title=course.title,
            description=course.description,
            chapter_count=course.chapter_count,
            image_url=course.image_url,
            completed_chapter_count=0, # This can be calculated if needed
            user_name=course.user.username if course.user else None,
            is_public=course.is_public,
            created_at=course.created_at,
        )
        result.append(course_info)
    
    return result


def get_courses_infos(db: Session, user_id: str, skip: int = 0, limit: int = 200) -> List[CourseInfo]:
    """Get course info by user ID with completed chapter count
    
    Args:
        db: Database session
        user_id: ID of the user to get courses for
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of CourseInfo objects containing course info with completed chapter count
    """
    # Subquery to count completed chapters per course
    completed_chapters_subq = (
        select(
            Chapter.course_id,
            sql_func.count(Chapter.id).label('completed_count')
        )
        .where(Chapter.is_completed == True)
        .group_by(Chapter.course_id)
        .subquery()
    )
    
    # Main query joining with the subquery
    courses = (db.query(
            Course,
            sql_func.coalesce(completed_chapters_subq.c.completed_count, 0).label('completed_chapters')
        )
        .outerjoin(
            completed_chapters_subq,
            Course.id == completed_chapters_subq.c.course_id
        )
        .filter(Course.user_id == user_id)
        .order_by(Course.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all())
    
    # Convert to list of CourseInfo objects
    result = []
    for course, completed_chapters in courses:
        course_info = CourseInfo(
            course_id=course.id,
            total_time_hours=course.total_time_hours,
            status=course.status.value,  # Convert enum to string
            title=course.title,
            description=course.description,
            chapter_count=course.chapter_count,
            image_url=course.image_url,
            completed_chapter_count=completed_chapters,
            is_public=course.is_public,
            created_at=course.created_at,
        )
        result.append(course_info)
    
    return result

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
