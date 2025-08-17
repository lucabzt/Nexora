
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
from ...db.crud import usage_crud


from ..schemas.statistics import (
    UsagePost,
)


router = APIRouter(
    prefix="/statistics",
    tags=["statistics"],
    responses={404: {"description": "Not found"}},
)



@router.get("/")
def get_statistics():
    # Dummy statistics data
    return JSONResponse({
        "users": 42,
        "courses": 7,
        "chapters": 23,
        "active_today": 12,
        "messages": 99
    })



@router.post("/usage")
def post_usage(
    usage: UsagePost,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Log a user action on the site.
    """
    return usage_crud.log_site_usage(db, usage)


@router.get("/{user_id}/total_learn_time")
def get_usage(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the total time spent on chapters by a user.
    """
    return usage_crud.get_total_time_spent_on_chapters(db, user_id)
