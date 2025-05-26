from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from ..schemas.course import CourseRequest, CourseResponse, SessionResponse
from ..models.db_user import User
from ..services.agent_service import agent_service
from ..services.session_service import user_session_service
from ..utils.auth import get_current_active_user
from ..db.database import get_db



router = APIRouter(
    prefix="/courses",
    tags=["courses"],
    responses={404: {"description": "Not found"}},
)


@router.post("/session", response_model=SessionResponse)
async def create_course_session(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Create a new learning session for the user"""
    session_id = await user_session_service.create_user_session(current_user.id)
    return SessionResponse(session_id=session_id)


@router.post("/create", response_model=CourseResponse)
async def create_course(
        course_request: CourseRequest,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """
    Create a personalized learning course based on user input.
    Requires authentication.
    """
    try:
        result = await agent_service.create_course(
            user_id=current_user.id,
            query=course_request.query,
            time_hours=course_request.time_hours
        )

        if result["status"] != "success":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("message", "Course creation failed")
            )

        return CourseResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating course: {str(e)}"
        )


@router.delete("/session")
async def cleanup_user_session(
        current_user: User = Depends(get_current_active_user)
):
    """Clean up user's agent sessions (call on logout)"""
    user_session_service.cleanup_user_sessions(current_user.id)
    return {"message": "Sessions cleaned up"}