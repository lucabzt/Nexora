import asyncio
import json
import random
import time
from typing import List, Optional

from google.adk.agents import LlmAgent
from google.adk.runners import Runner

from .instructions_txt import instructions
from .schema import MultipleChoiceQuestion, TaskStatus
from ..agent import StandardAgent
from ..utils import create_text_query


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

    async def generate_questions(self, text_content: str, difficulty: str, num_questions: int = 20, progress_callback=None) -> List[MultipleChoiceQuestion]:
        """Generate multiple choice questions from text content."""
        if len(text_content) > 50000:  # Large text, use chunking
            return await self._generate_questions_from_chunks(text_content, difficulty, num_questions, progress_callback)
        
        # For smaller texts, process directly
        prompt = f"""
        Generate {num_questions} multiple choice questions from the following text content.
        Difficulty level: {difficulty}
        
        Requirements:
        - Each question should test understanding of key concepts
        - Provide 4 answer choices (A, B, C, D)
        - Only one correct answer per question
        - Create plausible distractors that test common misconceptions
        - Questions should be clear and unambiguous
        - Focus on important concepts, not trivial details
        
        Text content:
        {text_content[:10000]}  # Limit to avoid token limits
        
        Return the response as a JSON array with this exact format:
        [
            {{
                "question": "Question text here?",
                "options": {{
                    "A": "First option",
                    "B": "Second option", 
                    "C": "Third option",
                    "D": "Fourth option"
                }},
                "correct_answer": "A",
                "explanation": "Brief explanation of why this is correct"
            }}
        ]
        """

        try:
            # Use the inherited run method from StandardAgent
            response = await self.run(
                user_id="system",
                state={},
                content=create_text_query(prompt)
            )

            response_text = response.get("explanation", "")
            questions_data = self._parse_questions_response(response_text)
            
            questions = []
            for q_data in questions_data:
                # Add credit note to explanation
                explanation = q_data.get("explanation", "")
                if explanation:
                    explanation += "\n\n---\n*Created with Nexora-AI* - [nexora-ai.de](https://nexora-ai.de)"
                else:
                    explanation = "---\n*Created with Nexora-AI* - [nexora-ai.de](https://nexora-ai.de)"
                
                question = MultipleChoiceQuestion(
                    question=q_data["question"],
                    options=q_data["options"],
                    correct_answer=q_data["correct_answer"],
                    explanation=explanation
                )
                questions.append(question)
            
            return questions[:num_questions]  # Ensure we don't exceed requested number
            
        except Exception as e:
            print(f"Error generating questions: {e}")
            return []

    async def _generate_questions_from_chunks(self, text_content: str, difficulty: str, num_questions: int, progress_callback=None) -> List[MultipleChoiceQuestion]:
        """Generate questions from large text by processing it in chunks with parallel processing."""
        # Split text into chunks
        chunks = self._split_text_into_chunks(text_content, chunk_size=8000, overlap=500)
        
        # Calculate questions per chunk
        questions_per_chunk = max(1, num_questions // len(chunks))
        
        # Use semaphore to limit concurrent requests
        semaphore = asyncio.Semaphore(3)  # Max 3 concurrent requests
        
        start_time = time.time()
        
        # Process chunks in parallel
        tasks = []
        for i, chunk in enumerate(chunks):
            chunk_questions = questions_per_chunk
            if i == len(chunks) - 1:  # Last chunk gets remaining questions
                chunk_questions = num_questions - (questions_per_chunk * (len(chunks) - 1))
            
            task = self._process_chunk_parallel(
                chunk, difficulty, chunk_questions, i, len(chunks), 
                semaphore, progress_callback, start_time
            )
            tasks.append(task)
        
        # Wait for all chunks to complete
        chunk_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Combine results
        all_questions = []
        for result in chunk_results:
            if isinstance(result, list):
                all_questions.extend(result)
            else:
                print(f"Error in chunk processing: {result}")
        
        # Shuffle and limit to requested number
        random.shuffle(all_questions)
        return all_questions

    async def _process_chunk_parallel(self, chunk: str, difficulty: str, chunk_questions: int, 
                                    chunk_index: int, total_chunks: int, semaphore: asyncio.Semaphore, 
                                    progress_callback=None, start_time=None) -> List[MultipleChoiceQuestion]:
        """Process a single chunk in parallel with rate limiting."""
        async with semaphore:
            try:
                # Add small delay to avoid overwhelming the API
                await asyncio.sleep(0.5 * chunk_index)
                
                prompt = f"""
                Generate {chunk_questions} multiple choice questions from the following text content.
                Difficulty level: {difficulty}
                
                Requirements:
                - Each question should test understanding of key concepts
                - Provide 4 answer choices (A, B, C, D)
                - Only one correct answer per question
                - Create plausible distractors that test common misconceptions
                - Questions should be clear and unambiguous
                - Focus on important concepts, not trivial details
                
                Text content:
                {chunk}
                
                Return the response as a JSON array with this exact format:
                [
                    {{
                        "question": "Question text here?",
                        "options": {{
                            "A": "First option",
                            "B": "Second option", 
                            "C": "Third option",
                            "D": "Fourth option"
                        }},
                        "correct_answer": "A",
                        "explanation": "Brief explanation of why this is correct"
                    }}
                ]
                """

                response = await self.run(
                    user_id="system",
                    state={},
                    content=create_text_query(prompt)
                )
                
                if response.get("status") != "success":
                    print(f"Error in agent response: {response}")
                    return []
                
                response_text = response.get("explanation", "")
                questions_data = self._parse_questions_response(response_text)
                
                questions = []
                for q_data in questions_data:
                    # Add credit note to explanation
                    explanation = q_data.get("explanation", "")
                    if explanation:
                        explanation += "\n\n---\n*Created with Nexora-AI* - [nexora-ai.de](https://nexora-ai.de)"
                    else:
                        explanation = "---\n*Created with Nexora-AI* - [nexora-ai.de](https://nexora-ai.de)"
                    
                    question = MultipleChoiceQuestion(
                        question=q_data["question"],
                        options=q_data["options"],
                        correct_answer=q_data["correct_answer"],
                        explanation=explanation
                    )
                    questions.append(question)
                
                # Update progress
                if progress_callback and start_time:
                    elapsed = time.time() - start_time
                    progress = 40 + int((chunk_index + 1) / total_chunks * 45)  # 40-85% range
                    progress_callback(TaskStatus.GENERATING, progress, {
                        "activity": f"Generated {len(questions)} questions from chunk {chunk_index + 1}/{total_chunks}",
                        "chunk_progress": f"{chunk_index + 1}/{total_chunks}",
                        "elapsed_time": f"{elapsed:.1f}s"
                    })
                
                return questions
                
            except Exception as e:
                print(f"Error processing chunk {chunk_index}: {e}")
                return []

    def _split_text_into_chunks(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        """Split text into overlapping chunks."""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < len(text):
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)
                
                if break_point > start + chunk_size // 2:  # Only if break point is reasonable
                    chunk = text[start:start + break_point + 1]
                    end = start + break_point + 1
            
            chunks.append(chunk.strip())
            start = end - overlap
            
            if start >= len(text):
                break
        
        return chunks

    def _parse_questions_response(self, response) -> List[dict]:
        """Parse the AI response to extract questions data."""
        try:
            # Extract JSON from response
            response_text = str(response)
            
            # Find JSON array in response
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON array found in response")
            
            json_str = response_text[start_idx:end_idx]
            questions_data = json.loads(json_str)
            
            # Validate structure
            validated_questions = []
            for q in questions_data:
                if all(key in q for key in ["question", "options", "correct_answer"]):
                    # Ensure options has A, B, C, D
                    if all(opt in q["options"] for opt in ["A", "B", "C", "D"]):
                        validated_questions.append(q)
            
            return validated_questions
            
        except Exception as e:
            print(f"Error parsing questions response: {e}")
            return []
