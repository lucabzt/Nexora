from datetime import datetime
from typing import List

from fastapi import UploadFile
from pydantic import BaseModel


class Document(BaseModel):
    """Document to upload"""
    file: UploadFile

class Image(BaseModel):
    """Image to upload"""
    file: UploadFile


class DocumentInfo(BaseModel):
    """Schema for document information (without file data)."""
    id: int
    filename: str
    content_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class ImageInfo(BaseModel):
    """Schema for image information (without image data)."""
    id: int
    filename: str
    content_type: str
    created_at: datetime

    class Config:
        from_attributes = True