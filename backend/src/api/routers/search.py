from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...db.database import get_db
from ...api.schemas.search import SearchResult
from ...services.search_service import search_courses_and_chapters
from ...utils.auth import get_current_active_user
from ...db.models.db_user import User
import traceback



router = APIRouter(
    prefix="/search",
    tags=["search"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[SearchResult])
async def search(
    query: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Search for courses and chapters that match the given query string.
    Returns a list of search results containing both courses and chapters.
    """
    if not query or len(query.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query must be at least 2 characters long"
        )
    
    try:
        results = await search_courses_and_chapters(db=db, query=query, user_id=str(current_user.id))
        return results
    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during search: {str(traceback.format_exc())}"
        )
