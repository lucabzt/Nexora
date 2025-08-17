from sqlalchemy.orm import Session
from typing import List
from ..models.db_usage import Usage
from ...api.schemas.statistics import UsagePost

def log_usage(db: Session, user_id: str, action: str, course_id: int = None, chapter_id: int = None, details: str = None) -> Usage:
    """
    Log a user action in the database.
    
    :param db: Database session
    :param user_id: ID of the user performing the action
    :param action: Action performed by the user (e.g., "view", "complete", "start", "create", "delete")
    :param course_id: Optional course ID if the action is related to a specific course
    :param chapter_id: Optional chapter ID if the action is related to a specific chapter
    :param details: Additional details about the action
    :return: The created Usage object
    """
    usage = Usage(
        user_id=user_id,
        action=action,
        course_id=course_id,
        chapter_id=chapter_id,
        details=details
    )
    
    db.add(usage)
    db.commit()
    db.refresh(usage)
    
    return usage


def get_user_usages(db: Session, user_id: str) -> List[Usage]:
    """
    Get all usage records for a specific user.
    
    :param db: Database session
    :param user_id: ID of the user
    :return: List of Usage objects for the user
    """
    return db.query(Usage).filter(Usage.user_id == user_id).all()


def get_usage_by_action(db: Session, user_id: str, action: str) -> List[Usage]:
    """
    Get all usage records for a specific user filtered by action.
    
    :param db: Database session
    :param user_id: ID of the user
    :param action: Action to filter by (e.g., "view", "complete", "start", "create", "delete")
    :return: List of Usage objects for the user with the specified action
    """
    return db.query(Usage).filter(Usage.user_id == user_id, Usage.action == action).all()


def log_chat_usage(db: Session, user_id: str, course_id: int, chapter_id: int, message: str) -> Usage:
    """
    Log a chat message sent by a user.
    
    :param db: Database session
    :param user_id: ID of the user sending the message
    :param message: The chat message content
    :return: The created Usage object
    """
    return log_usage(db, user_id, action="chat", course_id=course_id, chapter_id=chapter_id, details=message)


def get_total_chat_usages(db: Session, user_id: str) -> int:
    """
    Get the total number of chat messages sent by a user.
    
    :param db: Database session
    :param user_id: ID of the user
    :return: Total number of chat messages
    """
    return db.query(Usage).filter(Usage.user_id == user_id, Usage.action == "chat").count()


def get_total_created_courses(db: Session, user_id: str) -> int:
    """
    Get the total number of courses created by a user.
    
    :param db: Database session
    :param user_id: ID of the user
    :return: Total number of courses created
    """
    return db.query(Usage).filter(Usage.user_id == user_id, Usage.action == "create_course").count()

def log_course_creation(db: Session, user_id: str, course_id: int, detail: str) -> Usage:
    """
    Log the creation of a course by a user.
    
    :param db: Database session
    :param user_id: ID of the user creating the course
    :param course_id: ID of the created course
    :return: The created Usage object
    """
    return log_usage(db, user_id, action="create_course", course_id=course_id, details=detail)

def log_chapter_completion(db: Session, user_id: str, course_id: int, chapter_id: int) -> Usage:
    """
    Log the completion of a chapter by a user.
    
    :param db: Database session
    :param user_id: ID of the user completing the chapter
    :param course_id: ID of the course containing the chapter
    :param chapter_id: ID of the completed chapter
    :return: The created Usage object
    """
    return log_usage(db, user_id, action="complete_chapter", course_id=course_id, chapter_id=chapter_id)

def get_total_time_spent_on_chapters(db: Session, user_id: str) -> int:
    """
    Get the total time spent by a user on chapters: Calculate total time: every open followed by a close time differences summed up.
    Handles edge cases: skips unmatched opens, ignores unmatched closes, and processes in timestamp order.
    :param db: Database session
    :param user_id: ID of the user
    :return: Total time spent on chapters in minutes
    """
    usages = (
        db.query(Usage)
        .filter(Usage.user_id == user_id, Usage.action == "site_visible", Usage.course_id != None, Usage.chapter_id != None)
        .count()
    )

    return usages * 10


def get_user_with_total_usage_time(db: Session, offset: int = 0, limit: int = 200):
    """
    Get users with their total usage time in minutes.
    
    :param db: Database session
    :param offset: Number of records to skip (for pagination)
    :param limit: Maximum number of records to return (for pagination)
    :return: List of users with their total usage time in minutes
    """
    from sqlalchemy import func
    from ..models.db_user import User
    
    # Subquery to count site_visible actions per user
    usage_counts = (
        db.query(
            Usage.user_id,
            func.count('*').label('usage_count')
        )
        .filter(
            Usage.action == "site_visible",
            Usage.course_id != None,
            Usage.chapter_id != None
        )
        .group_by(Usage.user_id)
        .subquery()
    )
    
    # Main query to join with users and calculate total time
    user_usages = (
        db.query(
            User,
            (func.coalesce(usage_counts.c.usage_count, 0) * 10).label('total_usage_time')
        )
        .outerjoin(
            usage_counts,
            User.id == usage_counts.c.user_id
        )
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    # Format the result to include user object and total_usage_time
    return [
        {
            'user': user,
            'total_usage_time': total_usage_time
        }
        for user, total_usage_time in user_usages
    ]


def log_site_usage(db: Session, usage: UsagePost ) -> Usage:
    """
    Log a user action on the site.
    
    :param db: Database session
    :param usage: UsagePost object containing user_id, course_id, chapter_id, and url
    :return: The created Usage object
    """
    return log_usage(db,
        user_id=usage.user_id,
        action="site" + ("_visible" if usage.visible else "_hidden"),
        course_id=usage.course_id,
        chapter_id=usage.chapter_id,
        details=usage.url)

def log_login(db: Session, user_id: str) -> Usage:
    """
    Log a user login action.
    
    :param db: Database session
    :param user_id: ID of the user logging in
    :return: The created Usage object
    """
    return log_usage(db, user_id, action="login")

def log_admin_login_as(db: Session, user_who: str, user_as: str) -> Usage:
    """
    Log an admin login-as action.
    
    :param db: Database session
    :param user_who: ID of the admin logging in as
    :param user_as: ID of the user being logged in as
    :return: The created Usage object
    """
    return log_usage(db, user_who, action="admin_login_as", details="Admin logged in as user: " + user_as)


def log_refresh(db: Session, user_id: str) -> Usage:
    """
    Log a user refresh action.
    
    :param db: Database session
    :param user_id: ID of the user refreshing their session
    :return: The created Usage object
    """
    return log_usage(db, user_id, action="refresh")

def log_logout(db: Session, user_id: str) -> Usage:
    """
    Log a user logout action.
    
    :param db: Database session
    :param user_id: ID of the user logging out
    :return: The created Usage object
    """
    return log_usage(db, user_id, action="logout")

def get_login_count(db: Session, user_id: str) -> int:
    """
    Get the total number of login actions for a user.
    
    :param db: Database session
    :param user_id: ID of the user
    :return: Total number of login actions
    """
    return db.query(Usage).filter(Usage.user_id == user_id, Usage.action == "login").count()



def log_search(db: Session, user_id: str, query: str) -> Usage:
    """
    Log a search action performed by a user.
    
    :param db: Database session
    :param user_id: ID of the user performing the search
    :param query: The search query string
    :return: The created Usage object
    """
    return log_usage(db, user_id, action="search", details=query)