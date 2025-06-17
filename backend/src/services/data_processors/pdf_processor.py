# backend/src/services/pdf_processor.py
import fitz  # PyMuPDF
import re
from typing import List, Dict
import logging

class PDFProcessor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def extract_paragraphs_from_pdf(self, file_data: bytes) -> List[str]:
        """
        Extract text from PDF organized into paragraphs.
        Returns a list of paragraph strings.
        """
        try:
            doc = fitz.open(stream=file_data, filetype="pdf")
            all_paragraphs = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                # Extract text with layout information
                page_text = page.get_text()
                
                # Process page text into paragraphs
                page_paragraphs = self._split_into_paragraphs(page_text)
                all_paragraphs.extend(page_paragraphs)
            
            doc.close()
            return all_paragraphs
            
        except Exception as e:
            self.logger.error(f"PDF processing failed: {e}")
            return []
    
    def _split_into_paragraphs(self, text: str) -> List[str]:
        """
        Split text into paragraphs based on line breaks and spacing.
        """
        if not text.strip():
            return []
        
        # Normalize line endings
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        
        # Split on double line breaks (common paragraph separator)
        paragraphs = re.split(r'\n\s*\n', text)
        
        # Clean up each paragraph
        cleaned_paragraphs = []
        for para in paragraphs:
            # Remove excessive whitespace and join broken lines
            para = re.sub(r'\n+', ' ', para)  # Replace line breaks with spaces
            para = re.sub(r'\s+', ' ', para)  # Normalize multiple spaces
            para = para.strip()
            
            # Filter out very short "paragraphs" (likely headers/footers)
            if len(para) > 50:  # Minimum paragraph length
                cleaned_paragraphs.append(para)
        
        return cleaned_paragraphs
    
    def extract_structured_content(self, file_data: bytes) -> Dict:
        """
        Extract PDF content with metadata for each paragraph.
        Returns structured data including page numbers.
        """
        try:
            doc = fitz.open(stream=file_data, filetype="pdf")
            structured_content = {
                "paragraphs": [],
                "metadata": {
                    "total_pages": len(doc),
                }
            }
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_text = page.get_text()
                
                paragraphs = self._split_into_paragraphs(page_text)
                
                for para_index, paragraph in enumerate(paragraphs):
                    structured_content["paragraphs"].append({
                        "text": paragraph,
                        "page_number": page_num + 1,
                        "paragraph_index": para_index,
                        "word_count": len(paragraph.split())
                    })
            
            doc.close()
            return structured_content
            
        except Exception as e:
            self.logger.error(f"PDF structured extraction failed: {e}")
            return {"paragraphs": [], "metadata": {}}