import asyncio
import uuid
import os
import tempfile
import json
from typing import Dict, Any, Optional, Callable, List
from pathlib import Path
import shutil
from datetime import datetime

from ..agents.flashcard_agent.agent import FlashcardAgent
from ..agents.flashcard_agent.schema import (
    FlashcardConfig, TaskStatus, TaskProgress, FlashcardPreview
)


class TaskManager:
    """Manages flashcard generation tasks and their status."""
    
    def __init__(self):
        self.tasks: Dict[str, TaskProgress] = {}
        self.running_tasks: Dict[str, asyncio.Task] = {}
        self.task_configs: Dict[str, tuple] = {}  # Store (document_id, config) for retries
        
        # Setup persistent storage
        self.storage_dir = Path("/tmp/flashcard_tasks") if os.path.exists("/tmp") else Path("./flashcard_tasks")
        self.storage_dir.mkdir(exist_ok=True)
        
        # Load existing tasks from storage
        self._load_tasks_from_storage()
    
    def _load_tasks_from_storage(self):
        """Load tasks from persistent storage."""
        try:
            for task_file in self.storage_dir.glob("task_*.json"):
                with open(task_file, 'r') as f:
                    task_data = json.load(f)
                    task_id = task_data['task_id']
                    
                    # Recreate TaskProgress object
                    task = TaskProgress(
                        task_id=task_id,
                        status=TaskStatus(task_data['status']),
                        progress_percentage=task_data.get('progress_percentage', 0),
                        current_step=task_data.get('current_step', ''),
                        completed_steps=task_data.get('completed_steps', []),
                        error_message=task_data.get('error_message'),
                        download_url=task_data.get('download_url'),
                        step_details=task_data.get('step_details'),
                        activity_log=task_data.get('activity_log'),
                        stats=task_data.get('stats'),
                        estimated_time_remaining=task_data.get('estimated_time_remaining'),
                        started_at=task_data.get('started_at'),
                        completed_at=task_data.get('completed_at')
                    )
                    
                    self.tasks[task_id] = task
                    
                    # Load task config if available
                    if 'document_id' in task_data and 'config' in task_data:
                        config_data = task_data['config']
                        from ..agents.flashcard_agent.schema import FlashcardType, Difficulty, ChapterMode
                        config = FlashcardConfig(
                            type=FlashcardType(config_data['type']),
                            difficulty=Difficulty(config_data['difficulty']),
                            title=config_data['title'],
                            chapter_mode=ChapterMode(config_data['chapter_mode']),
                            slides_per_chapter=config_data.get('slides_per_chapter')
                        )
                        self.task_configs[task_id] = (task_data['document_id'], config)
                        
        except Exception as e:
            print(f"Warning: Failed to load tasks from storage: {e}")
    
    def _save_task_to_storage(self, task_id: str):
        """Save a task to persistent storage."""
        try:
            if task_id not in self.tasks:
                return
                
            task = self.tasks[task_id]
            task_data = {
                'task_id': task.task_id,
                'status': task.status.value,
                'progress_percentage': task.progress_percentage,
                'current_step': task.current_step,
                'completed_steps': task.completed_steps,
                'error_message': task.error_message,
                'download_url': task.download_url,
                'step_details': task.step_details,
                'activity_log': task.activity_log,
                'stats': task.stats,
                'estimated_time_remaining': task.estimated_time_remaining,
                'started_at': task.started_at,
                'completed_at': task.completed_at,
                'saved_at': datetime.now().isoformat()
            }
            
            # Add config data if available
            if task_id in self.task_configs:
                document_id, config = self.task_configs[task_id]
                task_data['document_id'] = document_id
                task_data['config'] = {
                    'type': config.type.value,
                    'difficulty': config.difficulty.value,
                    'title': config.title,
                    'chapter_mode': config.chapter_mode.value,
                    'slides_per_chapter': config.slides_per_chapter
                }
            
            task_file = self.storage_dir / f"task_{task_id}.json"
            with open(task_file, 'w') as f:
                json.dump(task_data, f, indent=2)
                
        except Exception as e:
            print(f"Warning: Failed to save task {task_id} to storage: {e}")
    
    def _delete_task_from_storage(self, task_id: str):
        """Delete a task from persistent storage."""
        try:
            task_file = self.storage_dir / f"task_{task_id}.json"
            if task_file.exists():
                task_file.unlink()
        except Exception as e:
            print(f"Warning: Failed to delete task {task_id} from storage: {e}")
    
    def create_task(self, document_id: str, config: FlashcardConfig) -> str:
        """Create a new flashcard generation task."""
        task_id = str(uuid.uuid4())
        
        self.tasks[task_id] = TaskProgress(
            task_id=task_id,
            status=TaskStatus.PENDING,
            progress_percentage=0,
            current_step="Initializing",
            completed_steps=[],
            started_at=datetime.now().isoformat()
        )
        
        # Store config for retry functionality
        self.task_configs[task_id] = (document_id, config)
        
        # Save to persistent storage
        self._save_task_to_storage(task_id)
        
        return task_id
    
    def get_task_status(self, task_id: str) -> Optional[TaskProgress]:
        """Get the current status of a task."""
        return self.tasks.get(task_id)
    
    def update_task_progress(self, task_id: str, status: TaskStatus, progress: int, step: str = "", error: str = None, details: Dict[str, Any] = None):
        """Update task progress with enhanced tracking."""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task.status = status
            task.progress_percentage = progress
            task.current_step = step
            
            if error:
                task.error_message = error
            
            # Update step details if provided
            if details:
                if not task.step_details:
                    task.step_details = {}
                task.step_details.update(details)
                
                # Add activity to log
                if "activity" in details:
                    if not task.activity_log:
                        task.activity_log = []
                    
                    import datetime
                    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
                    task.activity_log.append({
                        "timestamp": timestamp,
                        "message": details["activity"]
                    })
                    
                    # Keep only last 20 activities to avoid memory bloat
                    if len(task.activity_log) > 20:
                        task.activity_log = task.activity_log[-20:]
                
                # Update estimated time remaining
                if "estimated_time_remaining" in details:
                    task.estimated_time_remaining = details["estimated_time_remaining"]
                
                # Update stats
                if not task.stats:
                    task.stats = {}
                
                # Update processing stats
                for key in ["chunks_total", "chunks_completed", "questions_generated", "estimated_questions", "processing_speed"]:
                    if key in details:
                        task.stats[key] = details[key]
            
            # Add completed steps
            if status == TaskStatus.ANALYZING and "analyzing" not in task.completed_steps:
                task.completed_steps.append("analyzing")
            elif status == TaskStatus.EXTRACTING and "extracting" not in task.completed_steps:
                task.completed_steps.append("extracting")
            elif status == TaskStatus.GENERATING and "generating" not in task.completed_steps:
                task.completed_steps.append("generating")
            elif status == TaskStatus.PACKAGING and "packaging" not in task.completed_steps:
                task.completed_steps.append("packaging")
            elif status == TaskStatus.COMPLETED:
                task.completed_at = datetime.now().isoformat()
        
        # Save updated task to persistent storage
        self._save_task_to_storage(task_id)
    
    def cancel_task(self, task_id: str) -> bool:
        """Cancel a running task."""
        if task_id in self.running_tasks:
            self.running_tasks[task_id].cancel()
            del self.running_tasks[task_id]
            
            if task_id in self.tasks:
                self.tasks[task_id].status = TaskStatus.CANCELLED
                # Save updated task to persistent storage
                self._save_task_to_storage(task_id)
            
            return True
        return False
    
    def set_task_download_url(self, task_id: str, download_url: str):
        """Set the download URL for a completed task."""
        if task_id in self.tasks:
            self.tasks[task_id].download_url = download_url
            # Save updated task to persistent storage
            self._save_task_to_storage(task_id)


class DocumentManager:
    """Manages uploaded PDF documents."""
    
    def __init__(self):
        self.upload_dir = Path("/tmp/flashcard_uploads") if os.path.exists("/tmp") else Path("./flashcard_uploads")
        self.upload_dir.mkdir(exist_ok=True)
        self.documents: Dict[str, Dict[str, Any]] = {}
    
    def save_uploaded_file(self, file_content: bytes, filename: str) -> str:
        """Save uploaded file and return document ID."""
        document_id = str(uuid.uuid4())
        
        # Save file
        file_path = self.upload_dir / f"{document_id}_{filename}"
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Store metadata
        self.documents[document_id] = {
            "filename": filename,
            "file_path": str(file_path),
            "size": len(file_content)
        }
        
        return document_id
    
    def get_document_path(self, document_id: str) -> Optional[str]:
        """Get the file path for a document."""
        doc = self.documents.get(document_id)
        return doc["file_path"] if doc else None
    
    def get_document_info(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document metadata."""
        return self.documents.get(document_id)


class FlashcardService:
    """Main service for flashcard generation operations."""
    
    def __init__(self, app_name: str, session_service):
        self.app_name = app_name
        self.session_service = session_service
        self.flashcard_agent = FlashcardAgent(app_name, session_service)
        self.task_manager = TaskManager()
        self.document_manager = DocumentManager()
        self.output_dir = Path("/tmp/anki_output") if os.path.exists("/tmp") else Path("./anki_output")
        self.output_dir.mkdir(exist_ok=True)
    
    def upload_document(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Upload and save a PDF document."""
        document_id = self.document_manager.save_uploaded_file(file_content, filename)
        doc_info = self.document_manager.get_document_info(document_id)
        
        return {
            "id": document_id,
            "filename": doc_info["filename"],
            "size": doc_info["size"]
        }
    
    async def analyze_document(self, document_id: str, config: FlashcardConfig) -> Optional[FlashcardPreview]:
        """Analyze a document and return preview information."""
        pdf_path = self.document_manager.get_document_path(document_id)
        if not pdf_path or not os.path.exists(pdf_path):
            return None
        
        try:
            preview = await self.flashcard_agent.analyze_pdf(pdf_path, config)
            return preview
        except Exception as e:
            print(f"Error analyzing document {document_id}: {e}")
            return None
    
    def start_generation_task(self, document_id: str, config: FlashcardConfig) -> str:
        """Start a flashcard generation task."""
        task_id = self.task_manager.create_task(document_id, config)
        
        # Start the async task
        async_task = asyncio.create_task(
            self._run_generation_task(task_id, document_id, config)
        )
        self.task_manager.running_tasks[task_id] = async_task
        
        return task_id
    
    async def _run_generation_task(self, task_id: str, document_id: str, config: FlashcardConfig):
        """Run the actual flashcard generation task."""
        pdf_path = self.document_manager.get_document_path(document_id)
        if not pdf_path or not os.path.exists(pdf_path):
            self.task_manager.update_task_progress(
                task_id, TaskStatus.FAILED, 0, "File not found", "Document not found"
            )
            return
        
        try:
            # Create progress callback
            def progress_callback(status: TaskStatus, progress: int, details: Dict[str, Any] = None):
                step_name = status.value.title()
                error = details.get('error') if details else None
                self.task_manager.update_task_progress(task_id, status, progress, step_name, error, details)
            
            # Generate flashcards
            apkg_path = await self.flashcard_agent.generate_flashcards(
                pdf_path, config, progress_callback
            )
            
            # Move to output directory and set download URL
            final_filename = f"{task_id}.apkg"
            final_path = self.output_dir / final_filename
            shutil.move(apkg_path, final_path)
            
            download_url = f"/output/{final_filename}"
            self.task_manager.set_task_download_url(task_id, download_url)
            
        except Exception as e:
            self.task_manager.update_task_progress(
                task_id, TaskStatus.FAILED, 0, "Generation failed", str(e)
            )
        finally:
            # Clean up running task
            if task_id in self.task_manager.running_tasks:
                del self.task_manager.running_tasks[task_id]
    
    def get_task_status(self, task_id: str) -> Optional[TaskProgress]:
        """Get the status of a generation task."""
        return self.task_manager.get_task_status(task_id)
    
    def cancel_task(self, task_id: str) -> bool:
        """Cancel a running generation task."""
        return self.task_manager.cancel_task(task_id)
    
    def retry_task(self, task_id: str) -> Optional[str]:
        """Retry a failed task."""
        task = self.task_manager.get_task_status(task_id)
        if not task or task.status != TaskStatus.FAILED:
            return None
        
        # Get stored configuration
        if task_id not in self.task_manager.task_configs:
            return None
        
        document_id, config = self.task_manager.task_configs[task_id]
        
        # Reset task status
        task.status = TaskStatus.PENDING
        task.progress_percentage = 0
        task.current_step = "Retrying"
        task.completed_steps = []
        task.error_message = None
        
        # Start the async task again
        async_task = asyncio.create_task(
            self._run_generation_task(task_id, document_id, config)
        )
        self.task_manager.running_tasks[task_id] = async_task
        
        return task_id
    
    def get_download_path(self, task_id: str) -> Optional[str]:
        """Get the file path for downloading a completed task."""
        task = self.task_manager.get_task_status(task_id)
        if task and task.status == TaskStatus.COMPLETED and task.download_url:
            filename = task.download_url.split("/")[-1]
            return str(self.output_dir / filename)
        return None
    
    def get_processing_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user's processing history."""
        # In a real implementation, this would query a database
        # For now, return recent tasks from memory
        tasks = list(self.task_manager.tasks.values())
        tasks.sort(key=lambda x: x.task_id, reverse=True)  # Sort by creation time (task_id is UUID)
        return [{
            "task_id": task.task_id,
            "status": task.status.value,
            "progress_percentage": task.progress_percentage,
            "current_step": task.current_step,
            "completed_steps": task.completed_steps,
            "error_message": task.error_message,
            "download_url": task.download_url
        } for task in tasks[:limit]]
    
    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get processing statistics for the user."""
        tasks = list(self.task_manager.tasks.values())
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.status == TaskStatus.COMPLETED])
        failed_tasks = len([t for t in tasks if t.status == TaskStatus.FAILED])
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "failed_tasks": failed_tasks,
            "success_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        }
    
    def get_task_details(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a completed task."""
        task = self.task_manager.get_task_status(task_id)
        if not task:
            return None
        
        return {
            "task_id": task.task_id,
            "status": task.status.value,
            "progress_percentage": task.progress_percentage,
            "current_step": task.current_step,
            "completed_steps": task.completed_steps,
            "error_message": task.error_message,
            "download_url": task.download_url,
            "created_at": task.task_id,  # Using task_id as timestamp placeholder
        }
    
    def delete_task(self, task_id: str) -> bool:
        """Delete a processing task and its files."""
        if task_id not in self.task_manager.tasks:
            return False
        
        # Cancel if running
        self.task_manager.cancel_task(task_id)
        
        # Delete files if they exist
        task = self.task_manager.tasks[task_id]
        if task.download_url:
            filename = task.download_url.split("/")[-1]
            file_path = self.output_dir / filename
            if file_path.exists():
                file_path.unlink()
        
        # Remove from persistent storage
        self.task_manager._delete_task_from_storage(task_id)
        
        # Remove from memory
        del self.task_manager.tasks[task_id]
        
        # Remove stored config
        if task_id in self.task_manager.task_configs:
            del self.task_manager.task_configs[task_id]
        
        return True
