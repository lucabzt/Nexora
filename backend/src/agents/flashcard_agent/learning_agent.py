import asyncio
import json
from typing import Dict, Any, List

from google.adk.agents import LlmAgent
from google.adk.runners import Runner

from .instructions_txt import instructions
from .schema import LearningCard
from ..agent import StandardAgent
from ..utils import create_text_query


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
        """Generate learning flashcards from chapter content with parallel processing."""
        # Use semaphore to limit concurrent requests
        semaphore = asyncio.Semaphore(3)  # Max 3 concurrent requests
        
        # Process chapters in parallel
        tasks = []
        for i, chapter in enumerate(chapters):
            task = self._process_chapter_parallel(
                chapter, i, image_paths, pdf_data, semaphore
            )
            tasks.append(task)
        
        # Wait for all chapters to complete
        chapter_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Combine results
        all_cards = []
        for result in chapter_results:
            if isinstance(result, list):
                all_cards.extend(result)
            else:
                print(f"Error in chapter processing: {result}")
        
        return all_cards

    async def _process_chapter_parallel(self, chapter: Dict[str, Any], chapter_index: int, 
                                       image_paths: List[str], pdf_data: Dict[str, Any], 
                                       semaphore: asyncio.Semaphore) -> List[LearningCard]:
        """Process a single chapter in parallel with rate limiting."""
        async with semaphore:
            try:
                # Add small delay to avoid overwhelming the API
                await asyncio.sleep(0.5 * chapter_index)
                
                # Get chapter text
                chapter_text = ""
                if pdf_data and "pages" in pdf_data:
                    for page_idx in chapter["pages"]:
                        if page_idx < len(pdf_data["pages"]):
                            chapter_text += pdf_data["pages"][page_idx]["text"] + "\n"
                
                # Limit text length to avoid token limits
                if len(chapter_text) > 8000:
                    chapter_text = chapter_text[:8000] + "..."
                
                prompt = f"""
                Generate 3-5 learning flashcards from the following chapter content.
                Chapter: {chapter['title']}
                
                Requirements:
                - Create front/back style flashcards
                - Front should be a clear, concise question or prompt
                - Back should provide a comprehensive answer or explanation
                - Focus on key concepts, definitions, and important facts
                - Make cards that help with understanding and retention
                - Avoid overly complex or trivial information
                
                Chapter content:
                {chapter_text}
                
                Return the response as a JSON array with this exact format:
                [
                    {{
                        "front": "Question or prompt for the front of the card",
                        "back": "Detailed answer or explanation for the back of the card",
                        "chapter": "{chapter['title']}"
                    }}
                ]
                """

                response = await self.run(
                    user_id="system",
                    state={},
                    content=create_text_query(prompt)
                )

                response_text = response.get("explanation", "")
                cards_data = self._parse_cards_response(response_text)
                
                cards = []
                for card_data in cards_data:
                    card = LearningCard(
                        front=card_data["front"],
                        back=card_data["back"],
                        chapter=card_data.get("chapter", chapter["title"]),
                        image_path=None  # Images will be handled by AnkiDeckGenerator
                    )
                    cards.append(card)
                
                return cards
                
            except Exception as e:
                print(f"Error processing chapter {chapter_index}: {e}")
                return []

    def _parse_cards_response(self, response) -> List[dict]:
        """Parse the AI response to extract cards data."""
        try:
            # Extract JSON from response
            response_text = str(response)
            
            # Find JSON array in response
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON array found in response")
            
            json_str = response_text[start_idx:end_idx]
            cards_data = json.loads(json_str)
            
            # Validate structure
            validated_cards = []
            for card in cards_data:
                if all(key in card for key in ["front", "back"]):
                    validated_cards.append(card)
            
            return validated_cards
            
        except Exception as e:
            print(f"Error parsing cards response: {e}")
            return []
