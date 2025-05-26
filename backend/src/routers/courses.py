from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from ..models.db_user import User
from ..utils.auth import get_current_active_user
from ..db.database import get_db
import random
from datetime import datetime


from ..schemas.course import (
    CourseInfo,
    CourseRequest,
    Course as CourseSchema,
    Chapter as ChapterSchema,
    MultipleChoiceQuestion as MCQuestionSchema
)
from ..models.db_course import Course, Chapter, MultipleChoiceQuestion


router = APIRouter(
    prefix="/courses",
    tags=["courses"],
    responses={404: {"description": "Not found"}},
)


async def _verify_course_ownership(course_id: int, user_id: int, db: Session) -> Course:
    """
    Verify that a course belongs to the current user.
    Returns the course if valid, raises HTTPException if not found or unauthorized.
    """
    course = (db.query(Course)
              .filter(Course.id == course_id, Course.user_id == user_id)
              .first())
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or access denied"
        )
    
    return course




# TESTESTETS, nur zum testen, später curs und session und so gleichzeitig erstellen
@router.post("/new_demo", response_model=CourseSchema)
async def create_course(
        course_request: CourseRequest,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Create a new course for the user. 
    At the moment creates a demo course with example data based on the query.
    """
    
    # Generate a unique session_id (for now, just use timestamp + random)
    session_id = (int(datetime.now().timestamp() * 1000) + random.randint(1000, 9999)) % 214748364
    
    # Create demo course based on query
    demo_course = Course(
        session_id=session_id,
        user_id=current_user.id,
        title=f"Introduction to {course_request.query}",
        description=f"A comprehensive course covering the fundamentals of {course_request.query}. "
                   f"This demo course provides structured learning with interactive content.",
        total_time_hours=2
    )
    
    db.add(demo_course)
    db.commit()
    db.refresh(demo_course)
    
    # Create demo chapters
    demo_chapters_data = [
        {
            "index": 1,
            "caption": "Getting Started",
            "summary": f"Introduction to the basics of {course_request.query}",
            "content": f"# 🚀 Welcome to {course_request.query}!\n\n"
                      f"In this first chapter, we'll explore the fundamental concepts of {course_request.query}. "
                      f"You'll learn:\n\n"
                      f"- What {course_request.query} is and why it matters\n"
                      f"- Key terminology and concepts\n"
                      f"- How to get started with {course_request.query}\n"
                      f"- Common use cases and applications\n\n"
                      f"Let's dive in! 💡",
            "time_minutes": 30,
            "questions": [
                {
                    "question": f"What is the primary purpose of {course_request.query}?",
                    "answer_a": "Entertainment",
                    "answer_b": "Problem solving and efficiency",
                    "answer_c": "Social networking",
                    "answer_d": "Gaming",
                    "correct_answer": "b",
                    "explanation": f"{course_request.query} is primarily used for solving problems and improving efficiency."
                },
                {
                    "question": f"Which skill is most important when learning {course_request.query}?",
                    "answer_a": "Patience and practice",
                    "answer_b": "Mathematical genius",
                    "answer_c": "Artistic talent",
                    "answer_d": "Physical strength",
                    "correct_answer": "a",
                    "explanation": "Learning any new skill requires patience and consistent practice."
                }
            ]
        },
        {
            "index": 2,
            "caption": "Core Concepts",
            "summary": f"Deep dive into the main principles of {course_request.query}",
            "content": f"# 🎯 Core Concepts of {course_request.query}\n\n"
                      f"Now that you understand the basics, let's explore the core concepts that make {course_request.query} powerful:\n\n"
                      f"## 📚 Fundamental Principles\n"
                      f"- **Principle 1**: Understanding the foundation\n"
                      f"- **Principle 2**: Building upon basics\n"
                      f"- **Principle 3**: Applying knowledge practically\n\n"
                      f"## 🔧 Practical Applications\n"
                      f"Learn how these concepts apply in real-world scenarios and see examples of successful implementations.\n\n"
                      f"## 💡 Best Practices\n"
                      f"Discover the dos and don'ts when working with {course_request.query}.",
            "time_minutes": 45,
            "questions": [
                {
                    "question": f"What is the most fundamental concept in {course_request.query}?",
                    "answer_a": "Advanced techniques",
                    "answer_b": "Basic principles and foundations",
                    "answer_c": "Complex algorithms",
                    "answer_d": "Expert-level knowledge",
                    "correct_answer": "b",
                    "explanation": "Understanding basic principles and foundations is crucial before advancing to complex topics."
                },
                {
                    "question": f"How should you approach learning {course_request.query}?",
                    "answer_a": "Start with advanced topics",
                    "answer_b": "Skip the basics",
                    "answer_c": "Build step by step from foundations",
                    "answer_d": "Learn randomly",
                    "correct_answer": "c",
                    "explanation": "A systematic approach, building step by step from foundations, ensures solid understanding."
                },
                {
                    "question": f"What makes {course_request.query} practical?",
                    "answer_a": "Theoretical knowledge only",
                    "answer_b": "Real-world applications",
                    "answer_c": "Academic research",
                    "answer_d": "Historical context",
                    "correct_answer": "b",
                    "explanation": "Real-world applications make any subject practical and relevant."
                }
            ]
        },
        {
            "index": 3,
            "caption": "Advanced Topics",
            "summary": f"Exploring advanced aspects of {course_request.query}",
            "content": f"# 🚀 Advanced {course_request.query}\n\n"
                      f"Ready to take your {course_request.query} skills to the next level? In this advanced chapter, we'll cover:\n\n"
                      f"## 🎓 Advanced Techniques\n"
                      f"- Expert-level strategies\n"
                      f"- Optimization methods\n"
                      f"- Performance improvements\n\n"
                      f"## 🔬 Case Studies\n"
                      f"Analyze real-world examples and learn from successful implementations.\n\n"
                      f"## 🎯 Next Steps\n"
                      f"- Where to go from here\n"
                      f"- Additional resources\n"
                      f"- Community and networking\n\n"
                      f"Congratulations on reaching this advanced level! 🎉",
            "time_minutes": 45,
            "questions": [
                {
                    "question": f"What characterizes advanced {course_request.query} skills?",
                    "answer_a": "Basic understanding",
                    "answer_b": "Optimization and expert techniques",
                    "answer_c": "Memorizing facts",
                    "answer_d": "Following tutorials",
                    "correct_answer": "b",
                    "explanation": "Advanced skills involve optimization, expert techniques, and deep understanding."
                },
                {
                    "question": "What's the best way to continue learning after this course?",
                    "answer_a": "Stop learning",
                    "answer_b": "Practice, community engagement, and continuous learning",
                    "answer_c": "Only read books",
                    "answer_d": "Work alone",
                    "correct_answer": "b",
                    "explanation": "Continuous practice, community engagement, and lifelong learning are key to mastery."
                }
            ]
        }
    ]
    
    # Create chapters and questions
    for chapter_data in demo_chapters_data:
        # Create chapter
        chapter = Chapter(
            course_id=demo_course.id,
            index=chapter_data["index"],
            caption=chapter_data["caption"],
            summary=chapter_data["summary"],
            content=chapter_data["content"],
            time_minutes=chapter_data["time_minutes"],
            is_completed=False
        )
        db.add(chapter)
        db.commit()
        db.refresh(chapter)
        
        # Create questions for this chapter
        for q_data in chapter_data["questions"]:
            question = MultipleChoiceQuestion(
                chapter_id=chapter.id,
                question=q_data["question"],
                answer_a=q_data["answer_a"],
                answer_b=q_data["answer_b"],
                answer_c=q_data["answer_c"],
                answer_d=q_data["answer_d"],
                correct_answer=q_data["correct_answer"],
                explanation=q_data["explanation"]
            )
            db.add(question)
    
    db.commit()
    
    # Refresh course to get all relationships
    db.refresh(demo_course)
    
    # Build response with all chapters and questions
    chapters = []
    for chapter in sorted(demo_course.chapters, key=lambda x: x.index):
        mc_questions = [
            MCQuestionSchema(
                question=q.question,
                answer_a=q.answer_a,
                answer_b=q.answer_b,
                answer_c=q.answer_c,
                answer_d=q.answer_d,
                correct_answer=q.correct_answer,
                explanation=q.explanation
            ) for q in chapter.mc_questions
        ]
        
        chapters.append(ChapterSchema(
            index=chapter.index,
            caption=chapter.caption,
            summary=chapter.summary or "",
            content=chapter.content,
            mc_questions=mc_questions,
            time_minutes=chapter.time_minutes
        ))
    
    return CourseSchema(
        chapters=chapters,
        session_id=str(demo_course.session_id)
    )




@router.get("/", response_model=List[CourseInfo])
async def get_user_courses(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db),
        skip: int = 0,
        limit: int = 200
):
    """
    Get all courses belonging to the current user.
    Pagination supported with skip and limit parameters.
    """
    # Query courses that belong to the current user
    courses = (db.query(Course)
              .filter(Course.user_id == current_user.id)
              .offset(skip)
              .limit(limit)
              .all())
    
    # Convert to response format with chapters
    return [CourseInfo(course_id = course.id, description = course.description, title = course.title, session_id=course.session_id) for course in courses]
    


@router.get("/{course_id}", response_model=CourseSchema)
async def get_course_by_id(
        course_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Get a specific course by ID.
    Only accessible if the course belongs to the current user.
    """
    course = await _verify_course_ownership(course_id, current_user.id, db)
    
    # Build the complete course response
    chapters = []
    for chapter in course.chapters:
        mc_questions = [
            MCQuestionSchema(
                question=q.question,
                answer_a=q.answer_a,
                answer_b=q.answer_b,
                answer_c=q.answer_c,
                answer_d=q.answer_d,
                correct_answer=q.correct_answer,
                explanation=q.explanation
            ) for q in chapter.mc_questions
        ]
        
        chapters.append(ChapterSchema(
            index=chapter.index,
            caption=chapter.caption,
            summary=chapter.summary or "",
            content=chapter.content,
            mc_questions=mc_questions,
            time_minutes=chapter.time_minutes
        ))
    
    return CourseSchema(
        chapters=chapters,
        session_id=course.session_id
    )


@router.get("/{course_id}/chapters", response_model=List[ChapterSchema])
async def get_course_chapters(
        course_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Get all chapters for a specific course.
    Only accessible if the course belongs to the current user.
    """
    course = await _verify_course_ownership(course_id, current_user.id, db)
    
    chapters = []
    for chapter in course.chapters:
        mc_questions = [
            MCQuestionSchema(
                question=q.question,
                answer_a=q.answer_a,
                answer_b=q.answer_b,
                answer_c=q.answer_c,
                answer_d=q.answer_d,
                correct_answer=q.correct_answer,
                explanation=q.explanation
            ) for q in chapter.mc_questions
        ]
        
        chapters.append(ChapterSchema(
            index=chapter.index,
            caption=chapter.caption,
            summary=chapter.summary or "",
            content=chapter.content,
            mc_questions=mc_questions,
            time_minutes=chapter.time_minutes
        ))
    
    return chapters


@router.get("/{course_id}/chapters/{chapter_id}", response_model=ChapterSchema)
async def get_chapter_by_id(
        course_id: int,
        chapter_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Get a specific chapter by ID within a course.
    Only accessible if the course belongs to the current user.
    """
    # First verify course ownership
    course = await _verify_course_ownership(course_id, current_user.id, db)
    
    # Find the specific chapter
    chapter = (db.query(Chapter)
              .filter(Chapter.id == chapter_id, Chapter.course_id == course_id)
              .first())
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found in this course"
        )
    
    # Build chapter response with questions
    mc_questions = [
        MCQuestionSchema(
            question=q.question,
            answer_a=q.answer_a,
            answer_b=q.answer_b,
            answer_c=q.answer_c,
            answer_d=q.answer_d,
            correct_answer=q.correct_answer,
            explanation=q.explanation
        ) for q in chapter.mc_questions
    ]
    
    return ChapterSchema(
        index=chapter.index,
        caption=chapter.caption,
        summary=chapter.summary or "",
        content=chapter.content,
        mc_questions=mc_questions,
        time_minutes=chapter.time_minutes
    )


@router.patch("/{course_id}/chapters/{chapter_id}/complete")
async def mark_chapter_complete(
        course_id: int,
        chapter_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Mark a chapter as completed.
    Only accessible if the course belongs to the current user.
    """
    # First verify course ownership
    course = await _verify_course_ownership(course_id, current_user.id, db)
    
    # Find the specific chapter
    chapter = (db.query(Chapter)
              .filter(Chapter.id == chapter_id, Chapter.course_id == course_id)
              .first())
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found in this course"
        )
    
    # Mark as completed
    chapter.is_completed = True
    db.commit()
    db.refresh(chapter)
    
    return {"message": f"Chapter '{chapter.caption}' marked as completed"}