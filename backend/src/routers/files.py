from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io

from ..models.db_user import User
from ..utils.auth import get_current_active_user
from ..db.database import get_db
from ..schemas.file import (
    Document as DocumentSchema,
    Image as ImageSchema,
    DocumentInfo,
    ImageInfo
)
from ..models.db_file import Document, Image

router = APIRouter(
    prefix="/files",
    tags=["files"],
    responses={404: {"description": "Not found"}},
)

# File type configurations
ALLOWED_DOCUMENT_TYPES = {
    "application/pdf": [".pdf"],
    "text/plain": [".txt"],
    "application/json": [".json"],
    "text/csv": [".csv"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
}

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
}

# File size limits (in bytes)
MAX_DOCUMENT_SIZE = 30 * 1024 * 1024  # 30 MB TODO find suitable limit
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_file_type(filename: str, content_type: str, allowed_types: dict) -> bool:
    """Validate if file type is allowed."""
    if content_type not in allowed_types:
        return False

    # Check file extension
    filename_lower = filename.lower()
    allowed_extensions = allowed_types[content_type]
    return any(filename_lower.endswith(ext) for ext in allowed_extensions)


async def verify_document_ownership(doc_id: int, user_id: str, db: Session) -> Document:
    """Verify document belongs to current user."""
    document = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == user_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    return document


async def verify_image_ownership(image_id: int, user_id: int, db: Session) -> Image:
    """Verify image belongs to current user."""
    image = db.query(Image).filter(
        Image.id == image_id,
        Image.user_id == user_id
    ).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found or access denied"
        )
    return image


# ========== DOCUMENT ENDPOINTS ==========

@router.post("/documents", response_model=DocumentInfo)
async def upload_document(
        file: UploadFile = File(...),
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Upload a document (PDF, TXT, JSON, CSV, DOC, DOCX)."""
    # Validate file type
    if not validate_file_type(file.filename, file.content_type, ALLOWED_DOCUMENT_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {list(ALLOWED_DOCUMENT_TYPES.keys())}"
        )

    # Read file data
    file_data = await file.read()
    file_size = len(file_data)

    # Validate file size
    if file_size > MAX_DOCUMENT_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_DOCUMENT_SIZE // (1024 * 1024)} MB"
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file not allowed"
        )

    # Create document record
    document = Document(
        user_id=current_user.id,
        filename=file.filename,
        content_type=file.content_type,
        file_data=file_data,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@router.get("/documents", response_model=List[DocumentInfo])
async def get_course_documents(
        course_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db),
        skip: int = 0,
        limit: int = 100
):
    """Get all documents belonging to the given course and current user."""
    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .filter(Document.course_id == course_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return documents


@router.get("/documents/{doc_id}")
async def download_document(
        doc_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Download a specific document."""
    document = await verify_document_ownership(doc_id, current_user.id, db)

    return StreamingResponse(
        io.BytesIO(document.file_data),
        media_type=document.content_type,
        headers={"Content-Disposition": f"attachment; filename={document.filename}"}
    )


@router.get("/documents/{doc_id}/info", response_model=DocumentInfo)
async def get_document_info(
        doc_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Get document information without downloading the file."""
    document = await verify_document_ownership(doc_id, current_user.id, db)
    return document


@router.delete("/documents/{doc_id}", response_model=DocumentInfo)
async def delete_document(
        doc_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Delete a document."""
    document = await verify_document_ownership(doc_id, current_user.id, db)

    db.delete(document)
    db.commit()

    return document


# ========== IMAGE ENDPOINTS ==========

@router.post("/images", response_model=ImageInfo)
async def upload_image(
        file: UploadFile = File(...),
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Upload an image (JPEG, PNG, GIF, WebP)."""
    # Validate file type
    if not validate_file_type(file.filename, file.content_type, ALLOWED_IMAGE_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image type not allowed. Allowed types: {list(ALLOWED_IMAGE_TYPES.keys())}"
        )

    # Read file data
    image_data = await file.read()
    file_size = len(image_data)

    # Validate file size
    if file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image too large. Maximum size: {MAX_IMAGE_SIZE // (1024 * 1024)} MB"
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file not allowed"
        )

    # Create image record
    image = Image(
        user_id=current_user.id,
        filename=file.filename,
        content_type=file.content_type,
        image_data=image_data,
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return image


@router.get("/images", response_model=List[ImageInfo])
async def get_course_images(
        course_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db),
        skip: int = 0,
        limit: int = 100
):
    """Get all images belonging to the given course and current user."""
    images = (
        db.query(Image)
        .filter(Image.user_id == current_user.id)
        .filter(Image.course_id == course_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return images


@router.get("/images/{image_id}")
async def download_image(
        image_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Download a specific image."""
    image = await verify_image_ownership(image_id, current_user.id, db)

    return StreamingResponse(
        io.BytesIO(image.image_data),
        media_type=image.content_type,
        headers={"Content-Disposition": f"inline; filename={image.filename}"}
    )


@router.get("/images/{image_id}/info", response_model=ImageInfo)
async def get_image_info(
        image_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Get image information without downloading the file."""
    image = await verify_image_ownership(image_id, current_user.id, db)
    return image


@router.delete("/images/{image_id}", response_model=ImageInfo)
async def delete_image(
        image_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """Delete an image."""
    image = await verify_image_ownership(image_id, current_user.id, db)

    db.delete(image)
    db.commit()

    return image