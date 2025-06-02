from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from ..models.db_file import Document


############### DOCUMENTS
def get_document_by_id(db: Session, document_id: int) -> Optional[Document]:
    """Get document by ID"""
    return db.query(Document).filter(Document.id == document_id).first()

def get_documents_by_ids(db: Session, document_ids: List[int]) -> List[Document]:
    """Get multiple documents by their IDs"""
    if not document_ids:
        return []
    return db.query(Document).filter(Document.id.in_(document_ids)).all()


def get_documents_by_user_id(db: Session, user_id: str) -> List[Document]:
    """Get all documents for a specific user"""
    return db.query(Document).filter(Document.user_id == user_id).all()


def get_documents_by_course_id(db: Session, course_id: int) -> List[Document]:
    """Get all documents for a specific course"""
    return db.query(Document).filter(Document.course_id == course_id).all()


def get_documents_by_user_and_course(db: Session, user_id: str, course_id: int) -> List[Document]:
    """Get all documents for a specific user and course"""
    return db.query(Document).filter(
        and_(Document.user_id == user_id, Document.course_id == course_id)
    ).all()


def get_document_by_filename(db: Session, user_id: str, course_id: int, filename: str) -> Optional[Document]:
    """Get document by filename for a specific user and course"""
    return db.query(Document).filter(
        and_(
            Document.user_id == user_id,
            Document.course_id == course_id,
            Document.filename == filename
        )
    ).first()


def create_document(db: Session, course_id: int, user_id: str, filename: str,
                    content_type: str, file_data: bytes) -> Document:
    """Create a new document"""
    db_document = Document(
        course_id=course_id,
        user_id=user_id,
        filename=filename,
        content_type=content_type,
        file_data=file_data,
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


def update_document(db: Session, document_id: int, **kwargs) -> Optional[Document]:
    """Update document with provided fields"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if document:
        for key, value in kwargs.items():
            if hasattr(document, key):
                setattr(document, key, value)
        db.commit()
        db.refresh(document)
    return document


def update_document_data(db: Session, document_id: int, file_data: bytes,
                         content_type: str = None, filename: str = None) -> Optional[Document]:
    """Update document file data and optionally filename/content_type"""
    update_fields = {"file_data": file_data}
    if content_type:
        update_fields["content_type"] = content_type
    if filename:
        update_fields["filename"] = filename

    return update_document(db, document_id, **update_fields)


def delete_document(db: Session, document_id: int) -> bool:
    """Delete document by ID"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if document:
        db.delete(document)
        db.commit()
        return True
    return False


def delete_documents_by_course(db: Session, course_id: int) -> int:
    """Delete all documents for a specific course. Returns number of deleted documents."""
    deleted_count = db.query(Document).filter(Document.course_id == course_id).delete()
    db.commit()
    return deleted_count


def delete_documents_by_user(db: Session, user_id: str) -> int:
    """Delete all documents for a specific user. Returns number of deleted documents."""
    deleted_count = db.query(Document).filter(Document.user_id == user_id).delete()
    db.commit()
    return deleted_count


def get_document_count_by_course(db: Session, course_id: int) -> int:
    """Get total number of documents in a course"""
    return db.query(Document).filter(Document.course_id == course_id).count()


def get_document_count_by_user(db: Session, user_id: str) -> int:
    """Get total number of documents for a user"""
    return db.query(Document).filter(Document.user_id == user_id).count()


def get_documents_by_content_type(db: Session, user_id: str, content_type: str) -> List[Document]:
    """Get all documents of a specific content type for a user"""
    return db.query(Document).filter(
        and_(Document.user_id == user_id, Document.content_type == content_type)
    ).all()
