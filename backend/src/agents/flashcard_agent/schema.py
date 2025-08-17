from pydantic import BaseModel
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


class FlashcardConfig(BaseModel):
    type: FlashcardType
    difficulty: Difficulty = Difficulty.MEDIUM
    title: str = "Generated Flashcards"
    chapter_mode: ChapterMode = ChapterMode.AUTO
    slides_per_chapter: Optional[int] = None


class MultipleChoiceQuestion(BaseModel):
    question: str
    options: Dict[str, str]
    correct_answer: str
    explanation: Optional[str] = None


class LearningCard(BaseModel):
    front: str
    back: str
    chapter: str
    image_path: Optional[str] = None


class FlashcardPreview(BaseModel):
    type: FlashcardType
    estimated_cards: int
    sample_question: Optional[MultipleChoiceQuestion] = None
    sample_learning_card: Optional[LearningCard] = None
    chapters: Optional[List[str]] = None


class TaskProgress(BaseModel):
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


class GenerationRequest(BaseModel):
    document_id: str
    config: FlashcardConfig


class GenerationResponse(BaseModel):
    task_id: str
    status: TaskStatus = TaskStatus.PENDING
    message: str = "Task created successfully"
