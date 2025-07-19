import json
import os
import random
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional

import fitz  # PyMuPDF
import genanki
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.genai import types
from pdf2image import convert_from_path

from .instructions_txt import instructions
from .schema import (
    FlashcardConfig, FlashcardType, TaskStatus, MultipleChoiceQuestion, LearningCard, FlashcardPreview
)
from ..agent import StandardAgent
from ..utils import create_text_query


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
        
        else:
            # Auto chapter detection using TOC or heuristics
            toc = pdf_data.get("toc", [])
            
            if toc:
                chapters = []
                for i, (level, title, page_num) in enumerate(toc):
                    if level <= 1:  # Top-level chapters only
                        next_page = toc[i + 1][2] if i + 1 < len(toc) else pdf_data["metadata"]["page_count"]
                        chapters.append({
                            "title": title,
                            "start_page": page_num,
                            "end_page": next_page,
                            "pages": list(range(page_num - 1, next_page - 1))
                        })
                return chapters
            
            else:
                # Fallback: divide into equal chunks
                total_pages = pdf_data["metadata"]["page_count"]
                chunk_size = max(5, total_pages // 5)  # Aim for ~5 chapters
                chapters = []
                
                for i in range(0, total_pages, chunk_size):
                    end_page = min(i + chunk_size, total_pages)
                    chapters.append({
                        "title": f"Section {len(chapters) + 1}",
                        "start_page": i + 1,
                        "end_page": end_page,
                        "pages": list(range(i, end_page))
                    })
                
                return chapters


class TestingFlashcardAgent(StandardAgent):
    """Generates multiple choice questions for testing."""
    
    def __init__(self, app_name: str, session_service):
        # Call parent constructor to properly initialize StandardAgent
        super().__init__(app_name, session_service)
        
        self.llm_agent = LlmAgent(
            name="testing_flashcard_agent",
            model="gemini-2.5-pro",
            description="Agent for generating multiple choice questions from PDF content",
            global_instruction=lambda _: instructions,
            instruction="Generate multiple choice questions from the provided text content. Focus on key concepts and create plausible distractors."
        )

        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=self.llm_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )
    
    async def generate_questions(self, text_content: str, difficulty: str, num_questions: int = 20) -> List[MultipleChoiceQuestion]:
        """Generate multiple choice questions from text content."""
        
        prompt = f"""
        Generate {num_questions} multiple choice questions from the following text content.
        Difficulty level: {difficulty}
        
        Text content:
        {text_content[:3000]}  # Limit text to avoid token limits
        
        For each question, provide:
        1. A clear, well-formed question
        2. Four answer choices (without A), B), C), D) prefixes - just the choice text)
        3. The correct answer letter (A, B, C, or D)
        4. A brief explanation of why the correct answer is right
        
        Format your response as JSON with this structure:
        {{
            "questions": [
                {{
                    "question": "Question text here?",
                    "choices": ["Choice 1 text", "Choice 2 text", "Choice 3 text", "Choice 4 text"],
                    "correct_answer": "A",
                    "explanation": "Brief explanation of why this answer is correct."
                }}
            ]
        }}
        
        Make sure:
        - Questions are clear and unambiguous
        - All four choices are plausible but only one is correct
        - Choices don't include A), B), C), D) prefixes
        - Explanations are concise but informative
        - Questions test understanding, not just memorization
        """
        
        try:
            # Use the inherited run method from StandardAgent
            response = await self.run(
                user_id="system",
                state={},
                content=create_text_query(prompt)
            )
            
            # Parse the JSON response
            if isinstance(response, dict) and 'questions' in response:
                questions_data = response['questions']
            elif isinstance(response, dict) and 'explanation' in response:
                # Extract from StandardAgent response format
                import json
                response_text = response['explanation']
                
                # Remove markdown code block formatting if present
                if '```json' in response_text:
                    start = response_text.find('```json') + 7
                    end = response_text.rfind('```')
                    if end > start:
                        response_text = response_text[start:end].strip()
                elif '```' in response_text:
                    start = response_text.find('```') + 3
                    end = response_text.rfind('```')
                    if end > start:
                        response_text = response_text[start:end].strip()
                
                # Find JSON in response
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                if start >= 0 and end > start:
                    json_str = response_text[start:end]
                    parsed = json.loads(json_str)
                    questions_data = parsed.get('questions', [])
                else:
                    questions_data = []
            else:
                questions_data = []
            
            # Convert to MultipleChoiceQuestion objects
            questions = []
            for q_data in questions_data:
                questions.append(MultipleChoiceQuestion(
                    question=q_data['question'],
                    choices=q_data['choices'],
                    correct_answer=q_data['correct_answer'],
                    explanation=q_data.get('explanation', '')
                ))
            
            return questions
            
        except Exception as e:
            print(f"Error generating questions: {e}")
            return []


class LearningFlashcardAgent(StandardAgent):
    """Generates learning flashcards with images."""
    
    def __init__(self, app_name: str, session_service):
        # Call parent constructor to properly initialize StandardAgent
        super().__init__(app_name, session_service)
        
        self.llm_agent = LlmAgent(
            name="learning_flashcard_agent",
            model="gemini-2.5-pro",
            description="Agent for generating learning flashcards from PDF content",
            global_instruction=lambda _: instructions,
            instruction="Generate front/back learning flashcards from the provided content. Focus on key concepts and understanding."
        )

        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=self.llm_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )
    
    async def generate_learning_cards(self, chapters: List[Dict[str, Any]], image_paths: List[str], pdf_data: Dict[str, Any] = None) -> List[LearningCard]:
        """Generate learning flashcards from chapter content."""
        
        cards = []
        
        for i, chapter in enumerate(chapters):
            # Get chapter text
            chapter_text = ""
            if pdf_data and "pages" in pdf_data:
                for page_num in chapter.get("pages", []):
                    if page_num < len(pdf_data["pages"]):
                        chapter_text += pdf_data["pages"][page_num]["text"] + "\n"
            
            # Generate cards for this chapter
            prompt = f"""
            Create learning flashcards from this chapter content.
            Chapter: {chapter.get('title', f'Chapter {i+1}')}
            
            Content:
            {chapter_text[:2000]}  # Limit to avoid token limits
            
            Generate 3-5 flashcards with:
            - Front: A concept, term, or question
            - Back: Detailed explanation or answer
            
            Format as JSON:
            {{
                "cards": [
                    {{
                        "front": "Concept or question",
                        "back": "Detailed explanation"
                    }}
                ]
            }}
            """
            
            try:
                # Use the inherited run method from StandardAgent
                response = await self.run(
                    user_id="system",
                    state={},
                    content=create_text_query(prompt)
                )
                
                # Parse the JSON response
                if isinstance(response, dict) and 'cards' in response:
                    chapter_cards = response['cards']
                elif isinstance(response, dict) and 'explanation' in response:
                    # Extract from StandardAgent response format
                    import json
                    response_text = response['explanation']
                    
                    # Remove markdown code block formatting if present
                    if '```json' in response_text:
                        start = response_text.find('```json') + 7
                        end = response_text.rfind('```')
                        if end > start:
                            response_text = response_text[start:end].strip()
                    elif '```' in response_text:
                        start = response_text.find('```') + 3
                        end = response_text.rfind('```')
                        if end > start:
                            response_text = response_text[start:end].strip()
                    
                    # Find JSON in response
                    start = response_text.find('{')
                    end = response_text.rfind('}') + 1
                    if start >= 0 and end > start:
                        json_str = response_text[start:end]
                        parsed = json.loads(json_str)
                        chapter_cards = parsed.get('cards', [])
                    else:
                        chapter_cards = []
                else:
                    chapter_cards = []
                
                for card_data in chapter_cards:
                    # Use image if available
                    image_path = image_paths[i] if i < len(image_paths) else None
                    
                    cards.append(LearningCard(
                        front=card_data["front"],
                        back=card_data["back"],
                        image_path=image_path
                    ))
                        
            except Exception as e:
                print(f"Error generating cards for chapter {i}: {e}")
                continue
        
        return cards


class AnkiDeckGenerator:
    """Generates Anki .apkg files from flashcard data."""
    
    def __init__(self):
        self.output_dir = Path("/tmp/anki_output")
        self.output_dir.mkdir(exist_ok=True)
    
    def create_testing_deck(self, questions: List[MultipleChoiceQuestion], deck_name: str) -> str:
        """Create Anki deck for multiple choice questions with clickable options."""
        deck_id = random.randrange(1 << 30, 1 << 31)
        deck = genanki.Deck(deck_id, deck_name)
        
        # Define note model for interactive multiple choice
        model_id = random.randrange(1 << 30, 1 << 31)
        model = genanki.Model(
            model_id,
            'Interactive Multiple Choice Model',
            fields=[
                {'name': 'Question'},
                {'name': 'ChoiceA'},
                {'name': 'ChoiceB'},
                {'name': 'ChoiceC'},
                {'name': 'ChoiceD'},
                {'name': 'CorrectAnswer'},
                {'name': 'Explanation'},
            ],
            templates=[
                {
                    'name': 'Multiple Choice Card',
                    'qfmt': self._get_front_template(),
                    'afmt': self._get_back_template(),
                },
            ],
            css=self._get_mcq_css()
        )
        
        # Add notes to deck
        for question in questions:
            # Parse choices to individual fields
            choices = [choice.strip() for choice in question.choices]
            while len(choices) < 4:  # Ensure we have 4 choices
                choices.append("")
            
            # Find correct answer index
            correct_index = 0
            if question.correct_answer.upper() in ['A', 'B', 'C', 'D']:
                correct_index = ord(question.correct_answer.upper()) - ord('A')
            
            note = genanki.Note(
                model=model,
                fields=[
                    question.question,
                    choices[0] if len(choices) > 0 else "",
                    choices[1] if len(choices) > 1 else "",
                    choices[2] if len(choices) > 2 else "",
                    choices[3] if len(choices) > 3 else "",
                    chr(65 + correct_index),  # A, B, C, or D
                    question.explanation or ""
                ]
            )
            deck.add_note(note)
        
        # Generate package
        output_path = self.output_dir / f"{uuid.uuid4().hex}.apkg"
        genanki.Package(deck).write_to_file(str(output_path))
        
        return str(output_path)
    
    def _get_front_template(self) -> str:
        """Get the front template for interactive multiple choice cards."""
        return '''
<div class="mcq-container">
    <div class="question">{{Question}}</div>
    <div class="choices">
        {{#ChoiceA}}<div class="choice" data-choice="A" onclick="selectChoice(this)">A. {{ChoiceA}}</div>{{/ChoiceA}}
        {{#ChoiceB}}<div class="choice" data-choice="B" onclick="selectChoice(this)">B. {{ChoiceB}}</div>{{/ChoiceB}}
        {{#ChoiceC}}<div class="choice" data-choice="C" onclick="selectChoice(this)">C. {{ChoiceC}}</div>{{/ChoiceC}}
        {{#ChoiceD}}<div class="choice" data-choice="D" onclick="selectChoice(this)">D. {{ChoiceD}}</div>{{/ChoiceD}}
    </div>
</div>

<script>
function selectChoice(element) {
    // Remove previous selections
    document.querySelectorAll('.choice').forEach(choice => {
        choice.classList.remove('selected');
    });
    
    // Mark this choice as selected
    element.classList.add('selected');
    
    // Store the selected answer
    window.selectedAnswer = element.getAttribute('data-choice');
}
</script>
'''
    
    def _get_back_template(self) -> str:
        """Get the back template for interactive multiple choice cards."""
        return '''
<div class="mcq-container">
    <div class="question">{{Question}}</div>
    <div class="choices">
        {{#ChoiceA}}<div class="choice" data-choice="A" onclick="selectChoice(this)">A. {{ChoiceA}}</div>{{/ChoiceA}}
        {{#ChoiceB}}<div class="choice" data-choice="B" onclick="selectChoice(this)">B. {{ChoiceB}}</div>{{/ChoiceB}}
        {{#ChoiceC}}<div class="choice" data-choice="C" onclick="selectChoice(this)">C. {{ChoiceC}}</div>{{/ChoiceC}}
        {{#ChoiceD}}<div class="choice" data-choice="D" onclick="selectChoice(this)">D. {{ChoiceD}}</div>{{/ChoiceD}}
    </div>
    
    <div class="answer-section">
        <div class="correct-answer">Correct Answer: {{CorrectAnswer}}</div>
        {{#Explanation}}<div class="explanation">{{Explanation}}</div>{{/Explanation}}
    </div>
</div>

<script>
function selectChoice(element) {
    // Remove previous selections
    document.querySelectorAll('.choice').forEach(choice => {
        choice.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // Mark this choice as selected
    element.classList.add('selected');
    
    // Get the correct answer
    const correctAnswer = '{{CorrectAnswer}}';
    const selectedChoice = element.getAttribute('data-choice');
    
    // Show feedback
    document.querySelectorAll('.choice').forEach(choice => {
        const choiceValue = choice.getAttribute('data-choice');
        if (choiceValue === correctAnswer) {
            choice.classList.add('correct');
        } else if (choiceValue === selectedChoice && selectedChoice !== correctAnswer) {
            choice.classList.add('incorrect');
        }
    });
}

// Auto-highlight correct answer on back
document.addEventListener('DOMContentLoaded', function() {
    const correctAnswer = '{{CorrectAnswer}}';
    document.querySelectorAll('.choice').forEach(choice => {
        if (choice.getAttribute('data-choice') === correctAnswer) {
            choice.classList.add('correct');
        }
    });
});
</script>
'''
    
    def _get_mcq_css(self) -> str:
        """Get the CSS styles for multiple choice cards."""
        return '''
.mcq-container {
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

.question {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    line-height: 1.4;
    color: white;
}

.choices {
    margin-bottom: 20px;
}

.choice {
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 12px 16px;
    margin: 8px 0;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 16px;
    line-height: 1.4;
    color: black;
}

.choice:hover {
    background: #e9ecef;
    border-color: #6c757d;
}

.choice.selected {
    background: #cce5ff;
    border-color: #007bff;
}

.choice.correct {
    background: #d4edda;
    border-color: #28a745;
    color: #155724;
}

.choice.incorrect {
    background: #f8d7da;
    border-color: #dc3545;
    color: #721c24;
}

.answer-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #e9ecef;
}

.correct-answer {
    font-weight: bold;
    color: #28a745;
    margin-bottom: 10px;
    font-size: 16px;
}

.explanation {
    background: #f8f9fa;
    border-left: 4px solid #007bff;
    padding: 12px 16px;
    margin-top: 10px;
    font-style: italic;
    line-height: 1.4;
    color: black;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .mcq-container {
        padding: 15px;
    }
    
    .question {
        font-size: 16px;
    }
    
    .choice {
        font-size: 14px;
        padding: 10px 12px;
    }
}
'''
    
    def create_learning_deck(self, cards: List[LearningCard], deck_name: str) -> str:
        """Create Anki deck for learning flashcards."""
        deck_id = random.randrange(1 << 30, 1 << 31)
        deck = genanki.Deck(deck_id, deck_name)
        
        # Define note model for learning cards
        model_id = random.randrange(1 << 30, 1 << 31)
        model = genanki.Model(
            model_id,
            'Learning Card Model',
            fields=[
                {'name': 'Front'},
                {'name': 'Back'},
                {'name': 'Image'},
            ],
            templates=[
                {
                    'name': 'Card 1',
                    'qfmt': '{{Front}}<br>{{Image}}',
                    'afmt': '{{FrontSide}}<hr id="answer">{{Back}}',
                },
            ]
        )
        
        # Add notes to deck
        media_files = []
        for card in cards:
            image_html = ""
            if card.image_path and os.path.exists(card.image_path):
                image_filename = os.path.basename(card.image_path)
                image_html = f'<img src="{image_filename}" style="max-width: 100%; height: auto;">'
                media_files.append(card.image_path)
            
            note = genanki.Note(
                model=model,
                fields=[
                    card.front,
                    card.back,
                    image_html
                ]
            )
            deck.add_note(note)
        
        # Generate package
        output_path = self.output_dir / f"{uuid.uuid4().hex}.apkg"
        package = genanki.Package(deck)
        package.media_files = media_files
        package.write_to_file(str(output_path))
        
        return str(output_path)


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
            estimated_cards = min(50, max(10, len(pdf_data["pages"]) * 2))
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
        try:
            # Step 1: Analyze PDF
            if progress_callback:
                progress_callback(TaskStatus.ANALYZING, 10)
            
            pdf_data = self.pdf_parser.extract_text_and_metadata(pdf_path)
            chapters = self.pdf_parser.identify_chapters(pdf_data, config.chapter_mode.value, config.slides_per_chapter)
            
            # Step 2: Extract content
            if progress_callback:
                progress_callback(TaskStatus.EXTRACTING, 30)
            
            if config.type == FlashcardType.TESTING:
                # Step 3: Generate questions
                if progress_callback:
                    progress_callback(TaskStatus.GENERATING, 60)
                
                questions = await self.testing_agent.generate_questions(
                    pdf_data["total_text"], 
                    config.difficulty.value
                )
                
                # Step 4: Package
                if progress_callback:
                    progress_callback(TaskStatus.PACKAGING, 90)
                
                apkg_path = self.anki_generator.create_testing_deck(questions, config.title)
            
            else:  # LEARNING type
                # Extract images for chapters
                image_paths = []
                for chapter in chapters:
                    chapter_images = self.pdf_parser.extract_images_for_learning(pdf_path, chapter["pages"])
                    image_paths.extend(chapter_images)
                
                # Step 3: Generate learning cards
                if progress_callback:
                    progress_callback(TaskStatus.GENERATING, 60)
                
                cards = await self.learning_agent.generate_learning_cards(chapters, image_paths, pdf_data)
                
                # Step 4: Package
                if progress_callback:
                    progress_callback(TaskStatus.PACKAGING, 90)
                
                apkg_path = self.anki_generator.create_learning_deck(cards, config.title)
            
            if progress_callback:
                progress_callback(TaskStatus.COMPLETED, 100)
            
            return apkg_path
        
        except Exception as e:
            if progress_callback:
                progress_callback(TaskStatus.FAILED, 0, str(e))
            raise e
