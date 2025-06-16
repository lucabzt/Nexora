# backend/src/services/course_content_service.py
from typing import List
from sqlalchemy.orm import Session
from .data_processors.pdf_processor import PDFProcessor
from .vector_service import VectorService
from ..db.models.db_file import Document
import logging

class CourseContentService:
    def __init__(self):
        self.pdf_processor = PDFProcessor()
        self.vector_service = VectorService()
        self.logger = logging.getLogger(__name__)
    
    def process_course_documents(self, course_id: str, document_ids: List[int], db: Session):
        """
        Process all uploaded documents for a course and add to vector database.
        """
        try:
            # Get course-specific collection
            collection = self.vector_service.get_collection_by_course_id(course_id)
            
            for doc_id in document_ids:
                document = db.query(Document).filter(Document.id == doc_id).first()
                if not document:
                    self.logger.warning(f"Document {doc_id} not found")
                    continue
                
                # Only process PDFs for now
                if document.content_type == "application/pdf":
                    self._process_pdf_document(course_id, document, collection)
                else:
                    self.logger.info(f"Skipping non-PDF document: {document.filename}")
            
            self.logger.info(f"Processed {len(document_ids)} documents for course {course_id}")
            
        except Exception as e:
            self.logger.error(f"Failed to process documents for course {course_id}: {e}")
            raise
    
    def _process_pdf_document(self, course_id: str, document: Document, collection):
        """
        Extract paragraphs from PDF and add to vector database.
        """
        try:
            # Extract structured content
            content_data = self.pdf_processor.extract_structured_content(document.file_data)
            
            # Add each paragraph to vector database
            for para_data in content_data["paragraphs"]:
                content_id = f"doc_{document.id}_page_{para_data['page_number']}_para_{para_data['paragraph_index']}"
                
                metadata = {
                    "type": "pdf_paragraph",
                    "course_id": course_id,
                    "document_id": document.id,
                    "filename": document.filename,
                    "page_number": para_data["page_number"],
                    "paragraph_index": para_data["paragraph_index"],
                    "word_count": para_data["word_count"]
                }
                
                # Add to vector database
                self.vector_service.add_content_by_course_id(
                    course_id=course_id,
                    content_id=content_id,
                    text=para_data["text"],
                    metadata=metadata
                )
            
            self.logger.info(f"Added {len(content_data['paragraphs'])} paragraphs from {document.filename}")
            
        except Exception as e:
            self.logger.error(f"Failed to process PDF {document.filename}: {e}")
            raise