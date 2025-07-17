from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import uuid
from sqlalchemy.orm import Session
from typing import List, Optional

from ...db.models.db_course import Chapter, Course, CourseStatus
from ...db.models.db_user import User
from ...services.agent_service import AgentService
from ...utils.auth import get_current_active_user
from ...db.database import get_db, get_db_context, SessionLocal
from ...db.crud import courses_crud, chapters_crud, users_crud
from ...services import course_service
from ...services.course_service import verify_course_ownership

#from ...services.notification_service import manager as ws_manager
from ..schemas.course import (
    CourseInfo,
    CourseRequest,
    Chapter as ChapterSchema,
    UpdateCoursePublicStatusRequest,
)




router = APIRouter(
    prefix="/courses",
    tags=["courses"],
    responses={404: {"description": "Not found"}},
)
agent_service = AgentService()




@router.post("/create")
async def create_course_request(
        course_request: CourseRequest,
        background_tasks: BackgroundTasks,
        current_user: User = Depends(get_current_active_user)
) -> CourseInfo:
    """
    Initiate course creation as a background task and return a task ID for WebSocket progress updates.
    """
    
    with get_db_context() as db:
        # Create empty course in the database
        course = courses_crud.create_new_course(
            db=db,
            user_id=str(current_user.id),
            total_time_hours=course_request.time_hours,
            query_=course_request.query,
            language=course_request.language,
            difficulty=course_request.difficulty,
            status=CourseStatus.CREATING  # Set initial status to CREATING
        
        )
        if not course:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create course in the database"
            )
        
    
        task_id = str(uuid.uuid4())
        # Add the long-running course creation to background tasks
        # The agent_service.create_course will need to be modified to accept ws_manager and task_id
        background_tasks.add_task(
            agent_service.create_course,
                            user_id=str(current_user.id),
                            course_id=course.id,
                            request=course_request,
            task_id=task_id
        )

        return CourseInfo(
            course_id=int(course.id),
            total_time_hours=course_request.time_hours,
            status=course.status.value,  # Convert enum to string
            completed_chapter_count=0,
        )
                



@router.get("/public", response_model=List[CourseInfo])
async def get_public_courses(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """
    Get all public courses.
    """
    return course_service.get_public_courses(db, skip=skip, limit=limit)


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
    return course_service.get_user_courses( db, current_user.id, skip, limit)


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
    course = await verify_course_ownership(course_id, str(current_user.id), db)
    
    return CourseInfo(
        course_id=int(course.id),
        total_time_hours=int(course.total_time_hours),
        status=str(course.status),

        title=str(course.title),
        description=str(course.description),
        chapter_count=int(course.chapter_count) if course.chapter_count else None,
        image_url= str(course.image_url) if course.image_url else None,
        completed_chapter_count=course_service.get_completed_chapters_count(db, course.id),
        is_public=course.is_public,
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
    await verify_course_ownership(course_id, str(current_user.id), db)

    chapters = chapters_crud.get_chapters_by_course_id(db, course_id)
    if not chapters:
        return []

    # Convert SQLAlchemy Chapter objects to ChapterSchema using model_validate
    chapter_schemas = [ChapterSchema.model_validate(chapter) for chapter in chapters]

    return chapter_schemas


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
    course = await verify_course_ownership(course_id, str(current_user.id), db)
    
    # Find the specific chapter
    chapter = course_service.get_chapter_by_id(course_id, chapter_id, db)
    
    # Build chapter response
    return ChapterSchema(
        id=chapter.id,  
        index=chapter.index,
        caption=chapter.caption,
        summary=chapter.summary or "",
        content=chapter.content,
        image_url=chapter.image_url,
        time_minutes=chapter.time_minutes,
        is_completed=chapter.is_completed  
    )


@router.post("/{course_id}/chapters/{chapter_id}/close")
async def close_chapter(
        course_id: int,
        chapter_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Close a chapter.
    Only accessible if the course belongs to the current user.
    """
    # First verify course ownership
    await verify_course_ownership(course_id, str(current_user.id), db)
    
    # Log
    course_service.log_chapter_close(
        db=db,
        user_id=str(current_user.id),
        course_id=course_id,
        chapter_id=chapter_id
    )

    return {
        "message": f"Chapter '{chapter_id}' has been closed",
    }


@router.post("/{course_id}/chapters/{chapter_id}/open")
async def open_chapter(
        course_id: int,
        chapter_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Opens a chapter.
    Only accessible if the course belongs to the current user.
    """
    # First verify course ownership
    await verify_course_ownership(course_id, str(current_user.id), db)
    
    # Log
    course_service.log_chapter_open(
        db=db,
        user_id=str(current_user.id),
        course_id=course_id,
        chapter_id=chapter_id
    )

    return {
        "message": f"Chapter '{chapter_id}' has been closed",
    }


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
    course = await verify_course_ownership(course_id, current_user.id, db)
    
    # Find the specific chapter
    chapter = course_service.get_chapter_by_id(course_id, chapter_id, db)
    
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

@router.put("/{course_id}", response_model=CourseInfo)
async def update_course_details(
        course_id: int,
        title: str = None,
        description: str = None,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Update a course's title and description.
    """
    course = await verify_course_ownership(course_id, str(current_user.id), db)

    update_data = {}
    if title:
        update_data["title"] = title
    if description:
        update_data["description"] = description

    updated_course = courses_crud.update_course(db, course_id, **update_data)

    return CourseInfo(
        course_id=int(updated_course.id),
        total_time_hours=int(updated_course.total_time_hours),
        status=str(updated_course.status),
        title=str(updated_course.title),
        description=str(updated_course.description),
        chapter_count=int(updated_course.chapter_count) if updated_course.chapter_count else None,
        image_url=str(updated_course.image_url) if updated_course.image_url else None,
        completed_chapter_count=course_service.get_completed_chapters_count(db, course_id),
        is_public=updated_course.is_public,
    )


@router.patch("/{course_id}/public")
async def update_course_public_status(
    course_id: int,
    request: UpdateCoursePublicStatusRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update the public status of a course.
    """
    # Verify course ownership
    await verify_course_ownership(course_id, str(current_user.id), db)

    # Update the public status
    updated_course = courses_crud.update_course_public_status(db, course_id, request.is_public)

    if not updated_course:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update course public status"
        )

    return {"message": f"Course public status updated to {request.is_public}"}


@router.delete("/{course_id}")
async def delete_course(
        course_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Delete a course and all its chapters.
    Only accessible if the course belongs to the current user.
    """
    # Verify course ownership
    course = await verify_course_ownership(course_id, current_user.id, db)

    # Delete the course (cascades to chapters)
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
        image_url: Optional[str] = None,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Update chapter information.
    Only accessible if the course belongs to the current user.
    """
    # First verify course ownership
    _ = await verify_course_ownership(course_id, str(current_user.id), db)
    
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
    if image_url is not None:
        update_data["image_url"] = image_url

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update data provided"
        )

    # Update the chapter
    updated_chapter = chapters_crud.update_chapter(db, chapter_id, **update_data)

    if not updated_chapter:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update chapter"
        )

    # Build chapter response
    return ChapterSchema(
        id=updated_chapter.id,
        index=updated_chapter.index,
        caption=updated_chapter.caption,
        summary=updated_chapter.summary or "",
        content=updated_chapter.content,
        image_url=updated_chapter.image_url,
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
    Delete a chapter.
    Only accessible if the course belongs to the current user.
    """
    # First verify course ownership
    course = await verify_course_ownership(course_id, current_user.id, db)

    # Find the specific chapter
    chapter = course_service.get_chapter_by_id(course_id, chapter_id, db)

    chapter_caption = chapter.caption

    # Delete the chapter
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
    course = await verify_course_ownership(course_id, current_user.id, db)

    # Find the specific chapter
    chapter = course_service.get_chapter_by_id(course_id, chapter_id, db)

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
