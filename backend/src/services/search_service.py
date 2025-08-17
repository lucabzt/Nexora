import traceback
from typing import List
import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError


from ..db.crud.courses_crud import search_courses
from ..db.crud.chapters_crud import search_chapters_no_content, search_chapters_indexed
from ..api.schemas.search import SearchResult
from ..db.crud import usage_crud


async def search_courses_and_chapters(
    db: Session,
    query: str,
    user_id: str,
    limit: int = 20
) -> List[SearchResult]:
    """
    Search for courses and chapters that match the given query string.
    Returns a combined and ranked list of search results.
    
    Args:
        db: Database session
        query: Search query string
        user_id: ID of the current user for access control
        limit: Maximum number of results to return
        
    Returns:
        List of SearchResult objects containing matching courses and chapters
    """
    if not query or len(query.strip()) < 2:
        return []
    
    # Search for matching courses and chapters using CRUD functions
    print("Searching for courses and chapters...")

    try:
        #current_time = datetime.datetime.now()
        courses = search_courses(db, query, user_id=user_id, limit=limit)
        #time_d = datetime.datetime.now() - current_time
        #print("Found courses:", len(courses), " in ", time_d.total_seconds() * 1000, " milliseconds")

        #current_time = datetime.datetime.now()
        chapters = search_chapters_no_content(db, query, user_id=user_id, limit=limit)
        #time_d = datetime.datetime.now() - current_time
        #print("Found chapters:", len(chapters), " in ", time_d.total_seconds() * 1000, " milliseconds")
        if not chapters or len(chapters) == 0:
            # If no chapters found, try searching indexed chapters
            #current_time = datetime.datetime.now()
            print("No chapters found, trying indexed search...")
            chapters = search_chapters_indexed(db, query, user_id=user_id, limit=limit)
            #time_d = datetime.datetime.now() - current_time
            #print("Found chapters (2):", len(chapters_2), " in ", time_d.total_seconds() * 1000, " milliseconds")
    
    except SQLAlchemyError as e:
        print("Error searching indexed chapters:", e, traceback.format_exc())
        return []

        
    # Convert courses to search results
    course_results = [
        SearchResult(
            id=str(course.id),
            type="course",
            title=str(course.title),
            description=str(course.description),
            course_id=str(course.id)  # For consistency with chapters
        )
        for course in courses
        if str(course.user_id) == user_id
    ]
    
    # Convert chapters to search results
    chapter_results = []
    for chapter in chapters:
        # Skip chapters from courses the user doesn't have access to
        if not chapter.course or (str(chapter.course.user_id) != user_id):
            continue
            
        chapter_results.append(
            SearchResult(
                id=str(chapter.id),
                type="chapter",
                title=chapter.caption,
                description=chapter.summary or (chapter.content[:200] + '...' if chapter.content else None),
                course_id=str(chapter.course_id),
                course_title=chapter.course.title if chapter.course else None
            )
        )
    
    # Combine and sort results (simple ranking by match in title first, then description)
    results = course_results + chapter_results
    
    def sort_key(result: SearchResult) -> int:
        # Prioritize title matches over description matches
        title_match = query.lower() in (result.title or "").lower()
        return 0 if title_match else 1
    
    results.sort(key=sort_key)

    # Log
    usage_crud.log_search(
        db=db,
        user_id=user_id,
        query=query,
    )
    
    return results[:limit]
