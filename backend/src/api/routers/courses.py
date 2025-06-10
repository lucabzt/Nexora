from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import uuid
from sqlalchemy.orm import Session
from typing import List

from ...db.models.db_user import User
from ...services.agent_service import AgentService
from ...utils.auth import get_current_active_user
from ...db.database import get_db
from ...db.crud import courses_crud, chapters_crud, users_crud, questions_crud

from ...services.notification_service import manager as ws_manager
from ..schemas.course import (
    CourseInfo,
    CourseRequest,
    Chapter as ChapterSchema,
    MultipleChoiceQuestion as MCQuestionSchema
)
from ...db.models.db_course import Course, Chapter, CourseStatus

router = APIRouter(
    prefix="/courses",
    tags=["courses"],
    responses={404: {"description": "Not found"}},
)
agent_service = AgentService()

async def _verify_course_ownership(course_id: int, user_id: str, db: Session) -> Course:
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



@router.post("/create")
async def create_course_request(
        course_request: CourseRequest,
        background_tasks: BackgroundTasks,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
) -> CourseInfo:
    """
    Initiate course creation as a background task and return a task ID for WebSocket progress updates.
    """
   
   # Create empty course in the database
    course = courses_crud.create_new_course(
        db=db,
        user_id=str(current_user.id),
        total_time_hours=course_request.time_hours,
        query_=course_request.query,
        status=CourseStatus.CREATING  # Set initial status to CREATING
    )
    if not course:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create course in the database"
        )

    
    # Add the long-running course creation to background tasks
    # The agent_service.create_course will need to be modified to accept ws_manager and task_id
    # and use ws_manager.send_json_message(task_id, progress_data) to send updates.
    background_tasks.add_task(
        agent_service.create_course,
        user_id=str(current_user.id),
        course_id=course.id,
        request=course_request,
        db=db,
        task_id=str(uuid.uuid4()),  # Generate a unique task ID
        ws_manager=ws_manager
    )
    
    return CourseInfo(
        course_id=int(course.id),
        total_time_hours=course_request.time_hours,
        status=course.status.value,  # Convert enum to string
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
    
    return [
        CourseInfo(
            course_id=int(course.id),
            total_time_hours=int(course.total_time_hours),
            status=str(course.status),

            title=str(course.title),
            description=str(course.description),
            chapter_count=int(course.chapter_count) if course.chapter_count else None,
            image_url= str(course.image_url) if course.image_url else None

        ) for course in courses
    ]


@router.get("/{course_id}", response_model=CourseInfo)
async def get_course_by_id(
        course_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Get a specific course by ID.
    Only accessible if the course belongs to the current user.
    """
    course = await _verify_course_ownership(course_id, str(current_user.id), db)
    
    return CourseInfo(
        course_id=int(course.id),
        total_time_hours=int(course.total_time_hours),
        status=str(course.status),

        title=str(course.title),
        description=str(course.description),
        chapter_count=int(course.chapter_count) if course.chapter_count else None,
        image_url= str(course.image_url) if course.image_url else None
    )

# -------- CHAPTERS ----------
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
    course = await _verify_course_ownership(course_id, str(current_user.id), db)
   
    chapters = course.chapters

    # Build chapter response with questions
    chapters = [
        ChapterSchema(
            id=chapter.id,  # Add this
            index=chapter.index,
            caption=chapter.caption,
            summary=chapter.summary or "",
            content=chapter.content,
            mc_questions=[
                MCQuestionSchema(
                    question=q.question,
                    answer_a=q.answer_a,
                    answer_b=q.answer_b,
                    answer_c=q.answer_c,
                    answer_d=q.answer_d,
                    correct_answer=q.correct_answer,
                    explanation=q.explanation
                ) for q in chapter.mc_questions
            ],
            time_minutes=chapter.time_minutes,
            is_completed=chapter.is_completed  # Add this
        ) for chapter in chapters
    ]

    return chapters if chapters else []


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
    course = await _verify_course_ownership(course_id, str(current_user.id), db)
    
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
        id=chapter.id,  # Add this
        index=chapter.index,
        caption=chapter.caption,
        summary=chapter.summary or "",
        content=chapter.content,
        mc_questions=mc_questions,
        time_minutes=chapter.time_minutes,
        is_completed=chapter.is_completed  # Add this
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
    
    return {
        "message": f"Chapter '{chapter.caption}' marked as completed",
        "chapter_id": chapter.id,
        "is_completed": chapter.is_completed
    }


# -------- COURSE CRUD OPERATIONS ----------

@router.delete("/{course_id}")
async def delete_course(
        course_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Delete a course and all its chapters and questions.
    Only accessible if the course belongs to the current user.
    """
    # Verify course ownership
    course = await _verify_course_ownership(course_id, current_user.id, db)

    # Delete the course (cascades to chapters and questions)
    success = courses_crud.delete_course(db, course_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete course"
        )

    return {
        "message": f"Course '{course.title}' has been successfully deleted",
        "course_id": course_id
    }


# -------- CHAPTER CRUD OPERATIONS ----------

@router.put("/{course_id}/chapters/{chapter_id}", response_model=ChapterSchema)
async def update_chapter(
        course_id: int,
        chapter_id: int,
        caption: str,
        summary: str,
        content: str,
        time_minutes: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Update chapter information.
    Only accessible if the course belongs to the current user.
    """
    # First verify course ownership
    _ = await _verify_course_ownership(course_id, str(current_user.id), db)
    
    # Find the specific chapter
    chapter = (db.query(Chapter)
               .filter(Chapter.id == chapter_id, Chapter.course_id == course_id)
               .first())

    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found in this course"
        )

    # Build update data
    update_data = {}
    if caption is not None:
        update_data["caption"] = caption
    if summary is not None:
        update_data["summary"] = summary
    if content is not None:
        update_data["content"] = content
    if time_minutes is not None:
        update_data["time_minutes"] = time_minutes

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update data provided"
        )

    # Update the chapter
    updated_chapter = chapter_crud.update_chapter(db, chapter_id, **update_data)

    if not updated_chapter:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update chapter"
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
        ) for q in updated_chapter.mc_questions
    ]

    return ChapterSchema(
        id=updated_chapter.id,
        index=updated_chapter.index,
        caption=updated_chapter.caption,
        summary=updated_chapter.summary or "",
        content=updated_chapter.content,
        mc_questions=mc_questions,
        time_minutes=updated_chapter.time_minutes,
        is_completed=updated_chapter.is_completed
    )


@router.delete("/{course_id}/chapters/{chapter_id}")
async def delete_chapter(
        course_id: int,
        chapter_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Delete a chapter and all its questions.
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

    chapter_caption = chapter.caption

    # Delete the chapter (cascades to questions)
    success = chapters_crud.delete_chapter(db, chapter_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete chapter"
        )

    return {
        "message": f"Chapter '{chapter_caption}' has been successfully deleted",
        "chapter_id": chapter_id,
        "course_id": course_id
    }


@router.patch("/{course_id}/chapters/{chapter_id}/incomplete")
async def mark_chapter_incomplete(
        course_id: int,
        chapter_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Mark a chapter as incomplete (not completed).
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

    # Mark as incomplete using crud method
    updated_chapter = chapters_crud.mark_chapter_incomplete(db, chapter_id)

    if not updated_chapter:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark chapter as incomplete"
        )

    return {
        "message": f"Chapter '{chapter.caption}' marked as incomplete",
        "chapter_id": chapter.id,
        "is_completed": updated_chapter.is_completed
    }

