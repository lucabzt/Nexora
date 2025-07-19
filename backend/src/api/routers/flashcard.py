from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import FileResponse
from typing import Optional
import os

from ..schemas.flashcard import (
    UploadResponse, AnalyzeRequest, AnalyzeResponse, GenerateRequest, 
    GenerateResponse, TaskStatusResponse, TaskActionResponse,
    FlashcardConfigRequest, MultipleChoicePreview, LearningCardPreview
)
from ...services.flashcard_service import FlashcardService
from ...agents.flashcard_agent.schema import FlashcardConfig, FlashcardType
from ...utils.auth import get_current_active_user
from ...db.models.db_user import User

router = APIRouter(prefix="/anki", tags=["flashcard"])

# Global service instance - in a real app, this would be dependency injected
flashcard_service: Optional[FlashcardService] = None


def get_flashcard_service() -> FlashcardService:
    """Get the flashcard service instance."""
    global flashcard_service
    if flashcard_service is None:
        # Initialize with default values - you may want to inject these
        flashcard_service = FlashcardService("nexora", None)
    return flashcard_service


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Upload a PDF file for flashcard generation."""
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Validate file size (max 50MB)
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size too large (max 50MB)")
    
    try:
        result = service.upload_document(content, file.filename)
        return UploadResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_pdf(
    request: AnalyzeRequest,
    current_user: User = Depends(get_current_active_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Analyze a PDF and provide generation preview."""
    
    # Convert request to internal config
    config = FlashcardConfig(
        type=request.config.type,
        difficulty=request.config.difficulty,
        title=request.config.title,
        chapter_mode=request.config.chapter_mode,
        slides_per_chapter=request.config.slides_per_chapter
    )
    
    try:
        preview = await service.analyze_document(request.document_id, config)
        if preview is None:
            raise HTTPException(status_code=404, detail="Document not found or analysis failed")
        
        # Convert to response format
        response = AnalyzeResponse(
            estimated_cards=preview.estimated_cards,
            chapters=preview.chapters or []
        )
        
        if preview.sample_question:
            response.sample_question = MultipleChoicePreview(
                question=preview.sample_question.question,
                choices=preview.sample_question.choices,
                correct=preview.sample_question.correct_answer
            )
        
        if preview.sample_learning_card:
            response.sample_learning_card = LearningCardPreview(
                front=preview.sample_learning_card.front,
                back=preview.sample_learning_card.back
            )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/generate", response_model=GenerateResponse)
async def generate_flashcards(
    request: GenerateRequest,
    current_user: User = Depends(get_current_active_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Start flashcard generation process."""
    
    # Convert request to internal config
    config = FlashcardConfig(
        type=request.config.type,
        difficulty=request.config.difficulty,
        title=request.config.title,
        chapter_mode=request.config.chapter_mode,
        slides_per_chapter=request.config.slides_per_chapter
    )
    
    try:
        task_id = service.start_generation_task(request.document_id, config)
        return GenerateResponse(task_id=task_id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start generation: {str(e)}")


@router.get("/tasks/{task_id}/status", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_active_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Get the status of a flashcard generation task."""
    
    task = service.get_task_status(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return TaskStatusResponse(
        task_id=task.task_id,
        status=task.status,
        progress_percentage=task.progress_percentage,
        current_step=task.current_step,
        completed_steps=task.completed_steps,
        error_message=task.error_message,
        download_url=task.download_url
    )


@router.get("/tasks/{task_id}/download")
async def download_flashcards(
    task_id: str,
    current_user: User = Depends(get_current_active_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Download the generated flashcard deck."""
    
    file_path = service.get_download_path(task_id)
    if file_path is None or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found or task not completed")
    
    return FileResponse(
        path=file_path,
        filename=f"flashcards_{task_id}.apkg",
        media_type="application/octet-stream"
    )


@router.post("/tasks/{task_id}/cancel", response_model=TaskActionResponse)
async def cancel_task(
    task_id: str,
    current_user: User = Depends(get_current_active_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Cancel a running flashcard generation task."""
    
    success = service.cancel_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or not cancellable")
    
    return TaskActionResponse(
        task_id=task_id,
        status="cancelled",
        message="Task cancelled successfully"
    )


@router.post("/tasks/{task_id}/retry", response_model=TaskActionResponse)
async def retry_task(
    task_id: str,
    current_user: User = Depends(get_current_active_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Retry a failed flashcard generation task."""
    
    result = service.retry_task(task_id)
    if result is None:
        raise HTTPException(status_code=400, detail="Task cannot be retried")
    
    return TaskActionResponse(
        task_id=task_id,
        status="pending",
        message="Task retry initiated"
    )
