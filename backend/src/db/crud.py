from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from ..models.db_user import User
from ..models.db_course import Course, Chapter, MultipleChoiceQuestion, CourseStatus


############### USERS
def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, username: str, email: str, hashed_password: str) -> User:
    """Create a new user"""
    db_user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        is_active=True,
        is_admin=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: str, **kwargs) -> Optional[User]:
    """Update user with provided fields"""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        db.commit()
        db.refresh(user)
    return user


def delete_user(db: Session, user_id: str) -> bool:
    """Delete user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False


def get_all_users(db: Session) -> List[User]:
    """Get all users"""
    return db.query(User).all()


def get_active_users(db: Session) -> List[User]:
    """Get all active users"""
    return db.query(User).filter(User.is_active == True).all()


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


def create_course(db: Session, session_id: str, user_id: str, title: str,
                  description: str, total_time_hours: int, status: CourseStatus = CourseStatus.CREATING) -> Course:
    """Create a new course"""
    db_course = Course(
        session_id=session_id,
        user_id=user_id,
        title=title,
        description=description,
        total_time_hours=total_time_hours,
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
    results = db.query(Course.id).all()
    return [result[0] for result in results]


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
                   summary: str, content: str, time_minutes: int) -> Chapter:
    """Create a new chapter"""
    db_chapter = Chapter(
        course_id=course_id,
        index=index,
        caption=caption,
        summary=summary,
        content=content,
        time_minutes=time_minutes,
        is_completed=False
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


############### MULTIPLE CHOICE QUESTIONS
def get_question_by_id(db: Session, question_id: int) -> Optional[MultipleChoiceQuestion]:
    """Get question by ID"""
    return db.query(MultipleChoiceQuestion).filter(MultipleChoiceQuestion.id == question_id).first()


def get_questions_by_chapter_id(db: Session, chapter_id: int) -> List[MultipleChoiceQuestion]:
    """Get all questions for a specific chapter"""
    return db.query(MultipleChoiceQuestion).filter(MultipleChoiceQuestion.chapter_id == chapter_id).all()


def create_question(db: Session, chapter_id: int, question: str, answer_a: str,
                    answer_b: str, answer_c: str, answer_d: str, correct_answer: str,
                    explanation: str) -> MultipleChoiceQuestion:
    """Create a new question"""
    db_question = MultipleChoiceQuestion(
        chapter_id=chapter_id,
        question=question,
        answer_a=answer_a,
        answer_b=answer_b,
        answer_c=answer_c,
        answer_d=answer_d,
        correct_answer=correct_answer,
        explanation=explanation
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question


def create_multiple_questions(db: Session, chapter_id: int, questions_data: List[dict]) -> List[
    MultipleChoiceQuestion]:
    """Create multiple questions for a chapter at once"""
    db_questions = []
    for q_data in questions_data:
        db_question = MultipleChoiceQuestion(
            chapter_id=chapter_id,
            question=q_data['question'],
            answer_a=q_data['answer_a'],
            answer_b=q_data['answer_b'],
            answer_c=q_data['answer_c'],
            answer_d=q_data['answer_d'],
            correct_answer=q_data['correct_answer'],
            explanation=q_data['explanation']
        )
        db_questions.append(db_question)
        db.add(db_question)

    db.commit()
    for question in db_questions:
        db.refresh(question)
    return db_questions


def update_question(db: Session, question_id: int, **kwargs) -> Optional[MultipleChoiceQuestion]:
    """Update question with provided fields"""
    question = db.query(MultipleChoiceQuestion).filter(MultipleChoiceQuestion.id == question_id).first()
    if question:
        for key, value in kwargs.items():
            if hasattr(question, key):
                setattr(question, key, value)
        db.commit()
        db.refresh(question)
    return question


def delete_question(db: Session, question_id: int) -> bool:
    """Delete question by ID"""
    question = db.query(MultipleChoiceQuestion).filter(MultipleChoiceQuestion.id == question_id).first()
    if question:
        db.delete(question)
        db.commit()
        return True
    return False


def delete_questions_by_chapter(db: Session, chapter_id: int) -> int:
    """Delete all questions for a specific chapter. Returns number of deleted questions."""
    deleted_count = db.query(MultipleChoiceQuestion).filter(
        MultipleChoiceQuestion.chapter_id == chapter_id
    ).delete()
    db.commit()
    return deleted_count