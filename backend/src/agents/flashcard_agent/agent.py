from .pdf_parser import PDFParser
from .testing_agent import TestingFlashcardAgent
from .learning_agent import LearningFlashcardAgent
from .anki_generator import AnkiDeckGenerator
from .schema import FlashcardConfig, FlashcardType, TaskStatus, FlashcardPreview
from ..agent import StandardAgent


class FlashcardAgent(StandardAgent):
    """Main flashcard generation coordinator."""

    def __init__(self, app_name: str, session_service):
        self.app_name = app_name
        self.session_service = session_service
        self.pdf_parser = PDFParser()
        self.testing_agent = TestingFlashcardAgent(app_name, session_service)
        self.learning_agent = LearningFlashcardAgent(app_name, session_service)
        self.anki_generator = AnkiDeckGenerator()

    async def analyze_pdf(self, pdf_path: str, config: FlashcardConfig) -> FlashcardPreview:
        """Analyze PDF and provide preview of flashcard generation."""
        pdf_data = self.pdf_parser.extract_text_and_metadata(pdf_path)
        chapters = self.pdf_parser.identify_chapters(pdf_data, config.chapter_mode.value, config.slides_per_chapter)

        # Estimate number of cards
        if config.type == FlashcardType.TESTING:
            estimated_cards = min(1000, max(10, len(pdf_data["pages"]) * 2))
        else:
            estimated_cards = len(chapters) * 4  # ~4 cards per chapter

        # Generate sample content
        sample_question = None
        sample_learning_card = None

        if config.type == FlashcardType.TESTING:
            # Generate one sample question
            sample_text = pdf_data["total_text"][:2000]
            questions = await self.testing_agent.generate_questions(sample_text, config.difficulty.value, 1)
            if questions:
                sample_question = questions[0]

        else:
            # Generate one sample learning card
            if chapters:
                sample_cards = await self.learning_agent.generate_learning_cards([chapters[0]], [], pdf_data)
                if sample_cards:
                    sample_learning_card = sample_cards[0]

        return FlashcardPreview(
            type=config.type,
            estimated_cards=estimated_cards,
            sample_question=sample_question,
            sample_learning_card=sample_learning_card,
            chapters=[ch["title"] for ch in chapters]
        )

    async def generate_flashcards(self, pdf_path: str, config: FlashcardConfig, progress_callback=None) -> str:
        """Generate flashcards and return path to .apkg file."""
        import time
        start_time = time.time()

        try:
            # Step 1: Analyze PDF
            if progress_callback:
                progress_callback(TaskStatus.ANALYZING, 5, {
                    "activity": "Initializing PDF analysis and metadata extraction"
                })

            pdf_data = self.pdf_parser.extract_text_and_metadata(pdf_path)

            if progress_callback:
                progress_callback(TaskStatus.ANALYZING, 15, {
                    "activity": f"Extracted {len(pdf_data['pages'])} pages, {len(pdf_data['total_text'])} characters",
                    "pages_count": len(pdf_data['pages']),
                    "text_length": len(pdf_data['total_text'])
                })
            
            chapters = self.pdf_parser.identify_chapters(pdf_data, config.chapter_mode.value, config.slides_per_chapter)
            
            if progress_callback:
                progress_callback(TaskStatus.ANALYZING, 25, {
                    "activity": f"Identified {len(chapters)} chapters using {config.chapter_mode.value} mode",
                    "chapters_count": len(chapters),
                    "chapter_mode": config.chapter_mode.value
                })
            
            # Step 2: Extract content
            if progress_callback:
                progress_callback(TaskStatus.EXTRACTING, 35, {
                    "activity": "Setting up content extraction for flashcard generation"
                })
            
            if config.type == FlashcardType.TESTING:
                # Calculate number of questions based on PDF content
                total_pages = pdf_data["metadata"]["page_count"]
                total_text_length = len(pdf_data["total_text"])
                
                # Dynamic calculation: base on pages and text length
                questions_per_page = 2 if total_text_length / total_pages > 1000 else 1
                calculated_questions = min(1000, max(5, total_pages * questions_per_page))
                
                if progress_callback:
                    progress_callback(TaskStatus.GENERATING, 40, {
                        "activity": f"Generating {calculated_questions} questions from {total_pages} pages",
                        "estimated_questions": calculated_questions,
                        "pages_count": total_pages,
                        "difficulty": config.difficulty.value
                    })
                
                questions = await self.testing_agent.generate_questions(
                    pdf_data["total_text"], 
                    config.difficulty.value,
                    calculated_questions,
                    progress_callback
                )
                
                # Step 4: Package
                if progress_callback:
                    progress_callback(TaskStatus.PACKAGING, 90, {
                        "activity": f"Packaging {len(questions)} questions into .apkg file",
                        "questions_generated": len(questions)
                    })
                
                apkg_path = self.anki_generator.create_testing_deck(questions, config.title, pdf_path)
            
            else:  # LEARNING type
                # Extract images for chapters
                image_paths = []
                for chapter in chapters:
                    chapter_images = self.pdf_parser.extract_images_for_learning(pdf_path, chapter["pages"])
                    image_paths.extend(chapter_images)
                
                # Step 3: Generate learning cards
                if progress_callback:
                    progress_callback(TaskStatus.GENERATING, 60, {
                        "activity": f"Generating learning cards from {len(chapters)} chapters",
                        "chapters_count": len(chapters),
                        "images_extracted": len(image_paths)
                    })

                cards = await self.learning_agent.generate_learning_cards(chapters, image_paths, pdf_data)

                # Step 4: Package
                if progress_callback:
                    progress_callback(TaskStatus.PACKAGING, 90, {
                        "activity": f"Packaging {len(cards)} learning cards into .apkg file",
                        "cards_generated": len(cards)
                    })
                
                apkg_path = self.anki_generator.create_learning_deck(cards, config.title, pdf_path)
            
            if progress_callback:
                progress_callback(TaskStatus.COMPLETED, 100, {
                    "activity": "Flashcard generation completed successfully"
                })
            
            return apkg_path
        
        except Exception as e:
            if progress_callback:
                progress_callback(TaskStatus.FAILED, 0, {
                    "activity": f"Flashcard generation failed: {str(e)}",
                    "error": str(e)
                })
            raise e
