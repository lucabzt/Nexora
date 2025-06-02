from typing import List, Dict

from sqlalchemy.orm import Session

from .documents_crud import (
    get_documents_by_user_id,
    get_documents_by_course_id,
    delete_documents_by_course,
    delete_documents_by_user,
    get_document_count_by_course,
    get_document_count_by_user
    )
from .images_crud import (
    get_images_by_user_id,
    get_images_by_course_id,
    get_image_count_by_course,
    get_image_count_by_user,
    delete_images_by_course,
    delete_images_by_user,
    )

 
def get_all_files_by_course(db: Session, course_id: int) -> Dict[str, List]:
    """Get all documents and images for a course"""
    documents = get_documents_by_course_id(db, course_id)
    images = get_images_by_course_id(db, course_id)
    return {
        "documents": documents,
        "images": images
    }


def get_all_files_by_user(db: Session, user_id: str) -> Dict[str, List]:
    """Get all documents and images for a user"""
    documents = get_documents_by_user_id(db, user_id)
    images = get_images_by_user_id(db, user_id)
    return {
        "documents": documents,
        "images": images
    }


def delete_all_files_by_course(db: Session, course_id: int) -> Dict[str, int]:
    """Delete all documents and images for a course. Returns count of deleted files."""
    doc_count = delete_documents_by_course(db, course_id)
    img_count = delete_images_by_course(db, course_id)
    return {
        "documents_deleted": doc_count,
        "images_deleted": img_count
    }


def delete_all_files_by_user(db: Session, user_id: str) -> Dict[str, int]:
    """Delete all documents and images for a user. Returns count of deleted files."""
    doc_count = delete_documents_by_user(db, user_id)
    img_count = delete_images_by_user(db, user_id)
    return {
        "documents_deleted": doc_count,
        "images_deleted": img_count
    }


def get_file_counts_by_course(db: Session, course_id: int) -> Dict[str, int]:
    """Get count of documents and images for a course"""
    return {
        "document_count": get_document_count_by_course(db, course_id),
        "image_count": get_image_count_by_course(db, course_id)
    }


def get_file_counts_by_user(db: Session, user_id: str) -> Dict[str, int]:
    """Get count of documents and images for a user"""
    return {
        "document_count": get_document_count_by_user(db, user_id),
        "image_count": get_image_count_by_user(db, user_id)
    }
