from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/statistics")
def get_statistics():
    # Dummy statistics data
    return JSONResponse({
        "users": 42,
        "courses": 7,
        "chapters": 23,
        "active_today": 12,
        "messages": 99
    })
