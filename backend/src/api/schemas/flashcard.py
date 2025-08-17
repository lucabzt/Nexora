from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class FlashcardType(str, Enum):
    TESTING = "testing"
    LEARNING = "learning"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ChapterMode(str, Enum):
    AUTO = "auto"
    MANUAL = "manual"


class TaskStatus(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    EXTRACTING = "extracting"
    GENERATING = "generating"
    PACKAGING = "packaging"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class UploadResponse(BaseModel):
    id: str = Field(..., description="Document ID for the uploaded PDF")
    filename: str = Field(..., description="Original filename")
    size: int = Field(..., description="File size in bytes")


class FlashcardConfigRequest(BaseModel):
    type: FlashcardType
    difficulty: Difficulty = Difficulty.MEDIUM
    title: str = "Generated Flashcards"
    chapter_mode: ChapterMode = ChapterMode.AUTO
    slides_per_chapter: Optional[int] = None


class AnalyzeRequest(BaseModel):
    document_id: str
    config: FlashcardConfigRequest


class MultipleChoicePreview(BaseModel):
    question: str
    choices: List[str]
    correct: str


class LearningCardPreview(BaseModel):
    front: str
    back: str


class AnalyzeResponse(BaseModel):
    estimated_cards: int
    chapters: List[str]
    sample_question: Optional[MultipleChoicePreview] = None
    sample_learning_card: Optional[LearningCardPreview] = None


class GenerateRequest(BaseModel):
    document_id: str
    config: FlashcardConfigRequest


class GenerateResponse(BaseModel):
    task_id: str
    status: TaskStatus = TaskStatus.PENDING
    message: str = "Task created successfully"


class TaskStatusResponse(BaseModel):
    task_id: str
    status: TaskStatus
    progress_percentage: int = 0
    current_step: str = ""
    completed_steps: List[str] = []
    error_message: Optional[str] = None
    download_url: Optional[str] = None
    # Enhanced progress tracking
    step_details: Optional[Dict[str, Any]] = None
    activity_log: Optional[List[Dict[str, str]]] = None
    stats: Optional[Dict[str, Any]] = None
    estimated_time_remaining: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class TaskActionResponse(BaseModel):
    task_id: str
    status: TaskStatus
    message: str
