import asyncio
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
        self.output_dir = Path("/tmp/flashcard_images") if os.path.exists("/tmp") else Path("./flashcard_images")
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
            model="gemini-2.5-flash",
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
    
    async def generate_questions(self, text_content: str, difficulty: str, num_questions: int = 20, progress_callback=None) -> List[MultipleChoiceQuestion]:
        """Generate multiple choice questions from text content."""
        try:
            # For large texts, use chunking approach
            if len(text_content) > 8000:  # Threshold for chunking
                return await self._generate_questions_from_chunks(
                    text_content, difficulty, num_questions, progress_callback
                )
            
            # For smaller texts, generate directly
            if progress_callback:
                progress_callback(TaskStatus.GENERATING, 45, {
                    "activity": "Analyzing text content for question generation",
                    "estimated_questions": num_questions,
                    "text_length": len(text_content),
                    "difficulty": difficulty
                })
            
            prompt = f"""
You are an expert educator creating multiple choice questions.

Generate {num_questions} multiple choice questions from the following text.
Difficulty level: {difficulty}

Requirements:
- Each question should have exactly 4 choices (A, B, C, D)
- Only one choice should be correct
- Questions should test understanding, not just memorization
- Include brief explanations for the correct answers
- Focus on key concepts and important details
- Vary question types (factual, conceptual, analytical)

Text content:
{text_content[:4000]}...

Format your response as a JSON array of objects with this structure:
{{
    "question": "Your question here?",
    "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
    "correct_answer": "Choice A",
    "explanation": "Brief explanation of why this is correct"
}}

Generate exactly {num_questions} questions:
"""
            
            if progress_callback:
                progress_callback(TaskStatus.GENERATING, 55, {
                    "activity": "Requesting question generation from AI model",
                    "processing_speed": "Processing single batch"
                })

            response = await self.run(
                user_id="system",
                state={},
                content=create_text_query(prompt)
            )
            
            if progress_callback:
                progress_callback(TaskStatus.GENERATING, 75, {
                    "activity": "Parsing and validating generated questions"
                })
            
            questions = self._parse_questions_response(response)
            
            if progress_callback:
                progress_callback(TaskStatus.GENERATING, 85, {
                    "activity": f"Question generation complete - {len(questions)} questions created",
                    "questions_generated": len(questions),
                    "success_rate": f"{(len(questions)/num_questions)*100:.1f}%" if num_questions > 0 else "100%"
                })
            
            return questions[:num_questions]  # Ensure we don't exceed requested number
            
        except Exception as e:
            print(f"Error generating questions: {e}")
            if progress_callback:
                progress_callback(TaskStatus.FAILED, 0, {
                    "activity": f"Error occurred: {str(e)}",
                    "error": str(e)
                })
            return []
    
    async def _generate_questions_from_chunks(self, text_content: str, difficulty: str, num_questions: int, progress_callback=None) -> List[MultipleChoiceQuestion]:
        """Generate questions from large text by processing it in chunks with parallel processing."""
        import time
        start_time = time.time()
        
        try:
            # Split text into chunks of ~4000 characters with overlap for better context
            chunk_size = 4000
            overlap = 400
            chunks = self._split_text_into_chunks(text_content, chunk_size, overlap)
            
            if progress_callback:
                progress_callback(TaskStatus.GENERATING, 45, {
                    "activity": f"Text divided into {len(chunks)} processing chunks for parallel processing",
                    "chunks_total": len(chunks),
                    "chunks_completed": 0,
                    "text_length": len(text_content),
                    "chunk_size": chunk_size,
                    "parallel_processing": True
                })
            
            # Calculate questions per chunk
            questions_per_chunk = max(1, num_questions // len(chunks))
            remaining_questions = num_questions % len(chunks)
            
            # Create semaphore to limit concurrent API calls (prevent rate limiting)
            max_concurrent = min(8, len(chunks))  # Limit to 8 concurrent requests (Flash has higher limits)
            semaphore = asyncio.Semaphore(max_concurrent)
            
            # Report initial chunk processing details
            if progress_callback:
                progress_callback(TaskStatus.GENERATING, 60, {
                    "current_step": "generating",
                    "chunks_total": len(chunks),
                    "chunks_completed": 0,
                    "questions_generated": 0,
                    "estimated_questions": num_questions,
                    "max_concurrent": max_concurrent,
                    "activity": f"Starting parallel question generation from {len(chunks)} text chunks (max {max_concurrent} concurrent)"
                })
            
            # Create tasks for parallel processing
            tasks = []
            for i, chunk in enumerate(chunks):
                # Distribute remaining questions across first few chunks
                chunk_questions = questions_per_chunk + (1 if i < remaining_questions else 0)
                
                if chunk_questions > 0:
                    task = self._process_chunk_parallel(
                        chunk, difficulty, chunk_questions, i, len(chunks), 
                        semaphore, progress_callback, start_time
                    )
                    tasks.append(task)
            
            # Execute all tasks in parallel
            if progress_callback:
                progress_callback(TaskStatus.GENERATING, 65, {
                    "activity": f"Processing {len(tasks)} chunks in parallel...",
                    "tasks_created": len(tasks),
                    "max_concurrent": max_concurrent
                })
            
            # Process tasks with progress tracking
            all_questions = []
            successful_chunks = 0
            failed_chunks = 0
            
            # Use asyncio.as_completed for real-time progress updates
            completed_tasks = 0
            for completed_task in asyncio.as_completed(tasks):
                try:
                    result = await completed_task
                    completed_tasks += 1
                    
                    if isinstance(result, list):
                        all_questions.extend(result)
                        successful_chunks += 1
                    else:
                        failed_chunks += 1
                    
                    # Report progress as each chunk completes
                    if progress_callback:
                        progress_percent = int(65 + (completed_tasks / len(tasks)) * 20)
                        progress_callback(TaskStatus.GENERATING, progress_percent, {
                            "activity": f"Completed {completed_tasks}/{len(tasks)} chunks - {len(all_questions)} questions generated",
                            "questions_generated": len(all_questions),
                            "chunks_completed": completed_tasks,
                            "chunks_total": len(tasks),
                            "successful_chunks": successful_chunks,
                            "failed_chunks": failed_chunks,
                            "processing_mode": "parallel"
                        })
                        
                except Exception as e:
                    completed_tasks += 1
                    failed_chunks += 1
                    print(f"Error in chunk processing: {e}")
                    
                    if progress_callback:
                        progress_percent = int(65 + (completed_tasks / len(tasks)) * 20)
                        progress_callback(TaskStatus.GENERATING, progress_percent, {
                            "activity": f"Completed {completed_tasks}/{len(tasks)} chunks (with errors) - {len(all_questions)} questions generated",
                            "questions_generated": len(all_questions),
                            "chunks_completed": completed_tasks,
                            "chunks_total": len(tasks),
                            "successful_chunks": successful_chunks,
                            "failed_chunks": failed_chunks,
                            "processing_mode": "parallel",
                            "last_error": str(e)
                        })
            
            return all_questions[:num_questions]  # Trim to requested number
        
        except Exception as e:
            print(f"Error in parallel chunk processing: {e}")
            raise e
    
    async def _process_chunk_parallel(self, chunk: str, difficulty: str, chunk_questions: int, 
                                    chunk_index: int, total_chunks: int, semaphore: asyncio.Semaphore, 
                                    progress_callback=None, start_time=None) -> List[MultipleChoiceQuestion]:
        """Process a single chunk in parallel with rate limiting."""
        async with semaphore:  # Limit concurrent API calls
            chunk_prompt = f"""
            Generate {chunk_questions} multiple choice questions from the following text content.
            Difficulty level: {difficulty}
            
            Text content:
            {chunk}
            
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
                # Generate questions for this chunk
                response = await self.run(
                    user_id="system",
                    state={},
                    content=create_text_query(chunk_prompt)
                )
                
                # Parse response
                questions_data = self._parse_questions_response(response)
                
                # Convert to MultipleChoiceQuestion objects
                chunk_questions_list = []
                for q_data in questions_data:
                    chunk_questions_list.append(MultipleChoiceQuestion(
                        question=q_data['question'],
                        choices=q_data['choices'],
                        correct_answer=q_data['correct_answer'],
                        explanation=q_data.get('explanation', '')
                    ))
                
                return chunk_questions_list
                
            except Exception as chunk_error:
                print(f"Error processing chunk {chunk_index + 1}: {chunk_error}")
                return []  # Return empty list on error
    
    def _split_text_into_chunks(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        """Split text into overlapping chunks."""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundaries to avoid cutting mid-sentence
            if end < len(text):
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)
                
                if break_point > start + chunk_size // 2:  # Only break if it's not too early
                    chunk = text[start:start + break_point + 1]
                    end = start + break_point + 1
            
            chunks.append(chunk.strip())
            
            # Move start position with overlap
            start = end - overlap
            if start >= len(text):
                break
        
        return [chunk for chunk in chunks if len(chunk.strip()) > 100]  # Filter out tiny chunks
    
    def _parse_questions_response(self, response) -> List[dict]:
        """Parse the AI response to extract questions data."""
        try:
            if isinstance(response, dict) and 'questions' in response:
                return response['questions']
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
                    return parsed.get('questions', [])
            
            return []
        except Exception as e:
            print(f"Error parsing questions response: {e}")
            return []


class LearningFlashcardAgent(StandardAgent):
    """Generates learning flashcards with images."""
    
    def __init__(self, app_name: str, session_service):
        # Call parent constructor to properly initialize StandardAgent
        super().__init__(app_name, session_service)
        
        self.llm_agent = LlmAgent(
            name="learning_flashcard_agent",
            model="gemini-2.5-flash",
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
        """Generate learning flashcards from chapter content with parallel processing."""
        
        # Create semaphore to limit concurrent API calls
        max_concurrent = min(5, len(chapters))  # Limit to 5 concurrent requests for learning cards (Flash has higher limits)
        semaphore = asyncio.Semaphore(max_concurrent)
        
        # Create tasks for parallel processing
        tasks = []
        for i, chapter in enumerate(chapters):
            task = self._process_chapter_parallel(chapter, i, image_paths, pdf_data, semaphore)
            tasks.append(task)
        
        # Process tasks with real-time progress tracking
        all_cards = []
        successful_chapters = 0
        failed_chapters = 0
        completed_chapters = 0
        
        # Use asyncio.as_completed for real-time progress updates
        for completed_task in asyncio.as_completed(tasks):
            try:
                result = await completed_task
                completed_chapters += 1
                
                if isinstance(result, list):
                    all_cards.extend(result)
                    successful_chapters += 1
                else:
                    failed_chapters += 1
                
                print(f"Chapter {completed_chapters}/{len(chapters)} completed - {len(all_cards)} cards generated so far")
                    
            except Exception as e:
                completed_chapters += 1
                failed_chapters += 1
                print(f"Error processing chapter {completed_chapters}: {e}")
        
        print(f"Learning cards generation completed: {len(all_cards)} cards from {successful_chapters}/{len(chapters)} chapters")
        return all_cards
    
    async def _process_chapter_parallel(self, chapter: Dict[str, Any], chapter_index: int, 
                                       image_paths: List[str], pdf_data: Dict[str, Any], 
                                       semaphore: asyncio.Semaphore) -> List[LearningCard]:
        """Process a single chapter in parallel with rate limiting."""
        async with semaphore:  # Limit concurrent API calls
            try:
                # Get chapter text
                chapter_text = ""
                if pdf_data and "pages" in pdf_data:
                    for page_num in chapter.get("pages", []):
                        if page_num < len(pdf_data["pages"]):
                            chapter_text += pdf_data["pages"][page_num]["text"] + "\n"
                
                # Generate cards for this chapter
                prompt = f"""
                Create learning flashcards from this chapter content.
                Chapter: {chapter.get('title', f'Chapter {chapter_index+1}')}
                
                Content:
                {chapter_text[:3000]}  # Increased limit for better context
                
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
                
                # Convert to LearningCard objects
                cards = []
                for card_data in chapter_cards:
                    # Use image if available
                    image_path = image_paths[chapter_index] if chapter_index < len(image_paths) else None
                    
                    cards.append(LearningCard(
                        front=card_data["front"],
                        back=card_data["back"],
                        image_path=image_path
                    ))
                
                return cards
                        
            except Exception as e:
                print(f"Error generating cards for chapter {chapter_index}: {e}")
                return []  # Return empty list on error


class AnkiDeckGenerator:
    """Generates Anki .apkg files from flashcard data."""
    
    def __init__(self):
        self.output_dir = Path("/tmp/anki_output") if os.path.exists("/tmp") else Path("./anki_output")
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
            
            # Find the original correct answer index
            original_correct_index = 0
            if question.correct_answer.upper() in ['A', 'B', 'C', 'D']:
                original_correct_index = ord(question.correct_answer.upper()) - ord('A')
            
            # Get the correct answer text
            correct_answer_text = choices[original_correct_index] if original_correct_index < len(choices) else ""
            
            # Randomize the order of choices
            choice_pairs = list(enumerate(choices))
            random.shuffle(choice_pairs)
            
            # Create shuffled choices and find new correct answer position
            shuffled_choices = ["", "", "", ""]
            new_correct_index = 0
            
            for new_pos, (old_pos, choice_text) in enumerate(choice_pairs):
                if new_pos < 4:  # Only fill first 4 positions
                    shuffled_choices[new_pos] = choice_text
                    if choice_text == correct_answer_text:
                        new_correct_index = new_pos
            
            note = genanki.Note(
                model=model,
                fields=[
                    question.question,
                    shuffled_choices[0],
                    shuffled_choices[1], 
                    shuffled_choices[2],
                    shuffled_choices[3],
                    chr(65 + new_correct_index),  # A, B, C, or D based on new position
                    question.explanation or ""
                ]
            )
            deck.add_note(note)
        
        # Generate package
        output_path = self.output_dir / f"{uuid.uuid4().hex}.apkg"
        genanki.Package(deck).write_to_file(str(output_path))
        
        return str(output_path)
    
    def _get_persistence_script(self) -> str:
        """Get the persistence script for storing user selections."""
        return '''
<script>
// Anki Persistence - Simplified version of https://github.com/SimonLammer/anki-persistence
if (void 0 === window.Persistence) {
    var _persistenceKey = "github.com/SimonLammer/anki-persistence/";
    window.Persistence_sessionStorage = function() {
        var e = !1;
        try {
            "object" == typeof window.sessionStorage && (e = !0, 
                this.clear = function() {
                    for (var e = 0; e < sessionStorage.length; e++) {
                        var t = sessionStorage.key(e);
                        0 == t.indexOf(_persistenceKey) && (sessionStorage.removeItem(t), e--)
                    }
                }, 
                this.setItem = function(e, t) {
                    sessionStorage.setItem(_persistenceKey + e, JSON.stringify(t));
                }, 
                this.getItem = function(e) {
                    var t = sessionStorage.getItem(_persistenceKey + e);
                    return t ? JSON.parse(t) : null;
                },
                this.removeItem = function(e) {
                    sessionStorage.removeItem(_persistenceKey + e);
                });
        } catch (e) {}
        this.isAvailable = function() { return e; };
    };
    
    window.Persistence = new Persistence_sessionStorage();
    
    // Fallback to window object if sessionStorage not available
    if (!Persistence.isAvailable()) {
        window.Persistence = {
            _data: {},
            isAvailable: function() { return true; },
            clear: function() { this._data = {}; },
            setItem: function(key, value) { this._data[key] = value; },
            getItem: function(key) { return this._data[key] || null; },
            removeItem: function(key) { delete this._data[key]; }
        };
    }
}
</script>
'''

    def _get_front_template(self) -> str:
        """Get the front template for interactive multiple choice cards."""
        return self._get_persistence_script() + '''
<div class="mcq-container">
    <div class="question">{{Question}}</div>
    <div class="choices">
        {{#ChoiceA}}
        <div class="choice" data-choice="A" 
             onmousedown="this.style.transform='scale(0.98)';" 
             onmouseup="this.style.transform='';" 
             onmouseout="this.style.transform='';"
             onclick="selectChoice(this, 'A');">
            <span class="choice-letter">A.</span> {{ChoiceA}}
        </div>
        {{/ChoiceA}}
        
        {{#ChoiceB}}
        <div class="choice" data-choice="B" 
             onmousedown="this.style.transform='scale(0.98)';" 
             onmouseup="this.style.transform='';" 
             onmouseout="this.style.transform='';"
             onclick="selectChoice(this, 'B');">
            <span class="choice-letter">B.</span> {{ChoiceB}}
        </div>
        {{/ChoiceB}}
        
        {{#ChoiceC}}
        <div class="choice" data-choice="C" 
             onmousedown="this.style.transform='scale(0.98)';" 
             onmouseup="this.style.transform='';" 
             onmouseout="this.style.transform='';"
             onclick="selectChoice(this, 'C');">
            <span class="choice-letter">C.</span> {{ChoiceC}}
        </div>
        {{/ChoiceC}}
        
        {{#ChoiceD}}
        <div class="choice" data-choice="D" 
             onmousedown="this.style.transform='scale(0.98)';" 
             onmouseup="this.style.transform='';" 
             onmouseout="this.style.transform='';"
             onclick="selectChoice(this, 'D');">
            <span class="choice-letter">D.</span> {{ChoiceD}}
        </div>
        {{/ChoiceD}}
    </div>
</div>

<script>
// Store the correct answer for later comparison
const correctAnswer = '{{CorrectAnswer}}';

function selectChoice(element, choice) {
    // Remove previous selections
    const choices = document.querySelectorAll('.choice');
    for (let i = 0; i < choices.length; i++) {
        choices[i].classList.remove('selected');
    }
    
    // Mark this choice as selected
    element.classList.add('selected');
    
    // Store the selection
    if (Persistence.isAvailable()) {
        Persistence.setItem('selected_choice', choice);
        Persistence.setItem('correct_answer', correctAnswer);
    } else {
        // Fallback to data attribute
        const card = document.querySelector('.card');
        if (card) {
            card.setAttribute('data-selected-choice', choice);
            card.setAttribute('data-correct-answer', correctAnswer);
        }
    }
    
    // Show the answer (flip the card)
    py.link('showQuestion:answer');
}

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    // Only handle number keys 1-4
    if (event.key >= '1' && event.key <= '4') {
        const index = parseInt(event.key) - 1;
        const choices = document.querySelectorAll('.choice');
        if (index < choices.length) {
            const choice = choices[index];
            const choiceLetter = choice.getAttribute('data-choice');
            selectChoice(choice, choiceLetter);
        }
    }
});
</script>
'''
    
    def _get_back_template(self) -> str:
        """Get the back template for interactive multiple choice cards."""
        return self._get_persistence_script() + '''
<div class="mcq-container">
    <div class="question">{{Question}}</div>
    <div class="choices">
        {{#ChoiceA}}<div class="choice" data-choice="A"><span class="choice-letter">A.</span> {{ChoiceA}}</div>{{/ChoiceA}}
        {{#ChoiceB}}<div class="choice" data-choice="B"><span class="choice-letter">B.</span> {{ChoiceB}}</div>{{/ChoiceB}}
        {{#ChoiceC}}<div class="choice" data-choice="C"><span class="choice-letter">C.</span> {{ChoiceC}}</div>{{/ChoiceC}}
        {{#ChoiceD}}<div class="choice" data-choice="D"><span class="choice-letter">D.</span> {{ChoiceD}}</div>{{/ChoiceD}}
    </div>
    
    <div class="answer-section">
        <div class="correct-answer">Correct Answer: {{CorrectAnswer}}</div>
        {{#Explanation}}<div class="explanation">{{Explanation}}</div>{{/Explanation}}
    </div>
</div>

<script>
// Get the correct answer from template variables or persistence
let correctAnswer = '{{CorrectAnswer}}';
let selectedAnswer = null;

// Try to get the selected answer from persistence
if (Persistence.isAvailable()) {
    selectedAnswer = Persistence.getItem('selected_choice');
    // If we don't have a selected answer in persistence, check the card data attribute
    if (!selectedAnswer) {
        const card = document.querySelector('.card');
        selectedAnswer = card ? card.getAttribute('data-selected-choice') : null;
    }
    
    // Make sure we have the correct answer from persistence
    const persistedCorrectAnswer = Persistence.getItem('correct_answer');
    if (persistedCorrectAnswer) {
        correctAnswer = persistedCorrectAnswer;
    }
}

// Highlight the selected and correct answers when the back is shown
document.addEventListener('DOMContentLoaded', function() {
    // If we still don't have a selected answer, check the card's data attribute
    if (!selectedAnswer) {
        const card = document.querySelector('.card');
        selectedAnswer = card ? card.getAttribute('data-selected-choice') : null;
    }
    
    // Highlight answers
    document.querySelectorAll('.choice').forEach(choice => {
        const choiceValue = choice.getAttribute('data-choice');
        
        // Always highlight the correct answer in green
        if (choiceValue === correctAnswer) {
            choice.classList.add('correct');
        }
        
        // If this choice was selected and is incorrect, highlight it in red
        if (selectedAnswer && choiceValue === selectedAnswer && selectedAnswer !== correctAnswer) {
            choice.classList.add('incorrect');
        }
    });
});
</script>
'''
    
    def _get_mcq_css(self) -> str:
        """Get the CSS styles for multiple choice cards."""
        return '''
.mcq-container {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    -webkit-tap-highlight-color: transparent;
}

.question {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 24px;
    line-height: 1.5;
    color: #212529;
}

.choices {
    margin-bottom: 20px;
}

.choice {
    background: #ffffff;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 10px 0;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;
    line-height: 1.5;
    color: #212529;
    position: relative;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.choice:hover {
    background: #f8f9fa;
    border-color: #ced4da;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.choice:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.choice.selected {
    background: #e7f1ff;
    border-color: #0d6efd;
    color: #0a58ca;
}

.choice.correct {
    background: #d1e7dd;
    border-color: #198754;
    color: #0f5132;
}

.choice.incorrect {
    background: #f8d7da;
    border-color: #dc3545;
    color: #842029;
}

.choice-letter {
    font-weight: 600;
    margin-right: 8px;
    color: inherit;
}

.answer-section {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
}

.correct-answer {
    font-weight: 600;
    color: #198754;
    margin-bottom: 12px;
}

.explanation {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px 16px;
    margin-top: 12px;
    color: #495057;
    line-height: 1.5;
}

/* Better touch targets for mobile */
@media (max-width: 480px) {
    .choice {
        padding: 16px 20px;
        margin: 12px 0;
    }
    
    .question {
        font-size: 20px;
    }
}

/* Dark mode support */
.nightMode .question {
    color: #f8f9fa;
}

.nightMode .choice {
    background: #2d3035;
    border-color: #3d4046;
    color: #e9ecef;
}

.nightMode .choice:hover {
    background: #343a40;
    border-color: #495057;
}

.nightMode .explanation {
    background: #2d3035;
    color: #e9ecef;
}

.nightMode .choice.correct {
    background: #0f5132;
    border-color: #198754;
    color: #d1e7dd;
}

.nightMode .choice.incorrect {
    background: #842029;
    border-color: #dc3545;
    color: #f8d7da;
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
                
                apkg_path = self.anki_generator.create_testing_deck(questions, config.title)
            
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
                
                apkg_path = self.anki_generator.create_learning_deck(cards, config.title)
            
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
