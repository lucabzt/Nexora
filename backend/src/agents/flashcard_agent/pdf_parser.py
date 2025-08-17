import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional

import fitz  # PyMuPDF
from pdf2image import convert_from_path


class PDFParser:
    """Handles PDF parsing and content extraction."""
    
    def __init__(self):
        self.output_dir = Path("/tmp/flashcard_images")
        self.output_dir.mkdir(exist_ok=True)
    
    def extract_text_and_metadata(self, pdf_path: str) -> Dict[str, Any]:
        """Extract text content and metadata from PDF."""
        doc = fitz.open(pdf_path)
        
        # Extract basic metadata
        metadata = {
            "title": doc.metadata.get("title", "Unknown"),
            "author": doc.metadata.get("author", "Unknown"),
            "page_count": len(doc)
        }
        
        # Extract text content by page
        pages = []
        toc = doc.get_toc()  # Table of contents
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            pages.append({
                "page_num": page_num + 1,
                "text": text,
                "char_count": len(text)
            })

        doc.close()

        return {
            "metadata": metadata,
            "pages": pages,
            "toc": toc,
            "total_text": " ".join([p["text"] for p in pages])
        }

    def extract_images_for_learning(self, pdf_path: str, chapter_pages: List[int]) -> List[str]:
        """Convert specific PDF pages to images for learning flashcards."""
        try:
            # Convert specified pages to images
            images = convert_from_path(
                pdf_path,
                first_page=min(chapter_pages),
                last_page=max(chapter_pages),
                dpi=150
            )

            image_paths = []
            for i, img in enumerate(images):
                img_path = self.output_dir / f"chapter_{uuid.uuid4().hex[:8]}.png"
                img.save(img_path, "PNG")
                image_paths.append(str(img_path))

            return image_paths
        except Exception as e:
            print(f"Error converting PDF pages to images: {e}")
            return []
    
    def identify_chapters(self, pdf_data: Dict[str, Any], chapter_mode: str, slides_per_chapter: Optional[int] = None) -> List[Dict[str, Any]]:
        """Identify chapter boundaries in the PDF."""
        if chapter_mode == "manual" and slides_per_chapter:
            # Manual chapter division
            total_pages = pdf_data["metadata"]["page_count"]
            chapters = []

            for i in range(0, total_pages, slides_per_chapter):
                end_page = min(i + slides_per_chapter, total_pages)
                chapters.append({
                    "title": f"Chapter {len(chapters) + 1}",
                    "start_page": i + 1,
                    "end_page": end_page,
                    "pages": list(range(i, end_page))
                })

            return chapters

        elif chapter_mode == "auto":
            # Auto chapter detection using TOC
            toc = pdf_data.get("toc", [])
            if not toc:
                # Fallback to manual with default size
                return self.identify_chapters(pdf_data, "manual", 10)

            chapters = []
            for i, (level, title, page_num) in enumerate(toc):
                if level == 1:  # Main chapters only
                    start_page = page_num
                    # Find next chapter or end of document
                    end_page = pdf_data["metadata"]["page_count"]
                    for j in range(i + 1, len(toc)):
                        if toc[j][0] == 1:  # Next main chapter
                            end_page = toc[j][2] - 1
                            break

                    chapters.append({
                        "title": title,
                        "start_page": start_page,
                        "end_page": end_page,
                        "pages": list(range(start_page - 1, end_page))  # Convert to 0-indexed
                    })

            return chapters if chapters else self.identify_chapters(pdf_data, "manual", 10)

        else:
            # Default fallback
            return self.identify_chapters(pdf_data, "manual", 10)
