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

    def get_rag_infos(self, course_id: int, topic: dict[str, str]):
        """
        Get the important rag infos for a given chapter topic.
        """
        ragInfos = set()
        queryRes = self.vector_service.search_by_course_id(course_id, topic['caption'], n_results=2)
        for doc in queryRes['documents']:
            for str_inf in doc:
                ragInfos.add(str_inf)
        for content in topic['content']:
            queryRes = self.vector_service.search_by_course_id(course_id, content, n_results=3)
            for doc in queryRes['documents']:
                for str_inf in doc:
                    ragInfos.add(str_inf)
        return list(set(ragInfos))
    
    def process_course_documents(self, course_id: int, documents: List[Document]):
        """
        Process all uploaded documents for a course and add to vector database.
        """
        try:
            for document in documents:
                if not document:
                    self.logger.warning(f"Document {document.id} not found")
                    continue
                
                # Only process PDFs for now
                if document.content_type == "application/pdf":
                    self._process_pdf_document(course_id, document)
                else:
                    self.logger.info(f"Skipping non-PDF document: {document.filename}")
            
            self.logger.info(f"Processed {len(documents)} documents for course {course_id}")
            
        except Exception as e:
            self.logger.error(f"Failed to process documents for course {course_id}: {e}")
            raise
    
    def _process_pdf_document(self, course_id: int, document: Document):
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