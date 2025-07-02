"""
This file defines the service that coordinates the interaction between all the agents
"""
import json
import asyncio
import traceback
from typing import List
from logging import getLogger


from google.adk.sessions import InMemorySessionService

from ..services import vector_service
from ..services.course_content_service import CourseContentService

from .query_service import QueryService
from .state_service import StateService, CourseState
from ..agents.explainer_agent.agent import ExplainerAgent
from ..agents.grader_agent.agent import GraderAgent
from ..db.crud import chapters_crud, documents_crud, images_crud, questions_crud, courses_crud


from google.adk.sessions import InMemorySessionService

from ..agents.planner_agent import PlannerAgent
from ..agents.info_agent.agent import InfoAgent

from ..agents.image_agent.agent import ImageAgent

from ..agents.tester_agent import TesterAgent
from ..agents.utils import create_text_query
from ..db.models.db_course import CourseStatus
from ..api.schemas.course import CourseRequest
#from ..services.notification_service import WebSocketConnectionManager
from ..db.models.db_course import Course
from ..db.database import get_db_context
from google.genai import types

#from .data_processors.pdf_processor import PDFProcessor

from ..db.models.db_file import Document, Image
from ..db.crud import usage_crud



logger = getLogger(__name__)


class AgentService:
    def __init__(self):
        
        # session
        self.session_service = InMemorySessionService()
        self.app_name = "Nexora"
        self.state_manager = StateService()
        self.query_service = QueryService(self.state_manager)
        
        # define agents
        self.info_agent = InfoAgent(self.app_name, self.session_service)
        self.planner_agent = PlannerAgent(self.app_name, self.session_service)
        self.coding_agent = ExplainerAgent(self.app_name, self.session_service)
        self.tester_agent = TesterAgent(self.app_name, self.session_service)
        self.image_agent = ImageAgent(self.app_name, self.session_service)
        self.grader_agent = GraderAgent(self.app_name, self.session_service)

        # define Rag service
        self.vector_service = vector_service.VectorService()
        self.contentService = CourseContentService()


    @staticmethod
    async def save_questions(db, questions, chapter_id):
        """ Save questions to database."""
        for q_data in questions:
            if 'answer_a' in q_data.keys():
                questions_crud.create_mc_question(
                    db=db,
                    chapter_id=chapter_id,
                    question=q_data['question'],
                    answer_a=q_data['answer_a'],
                    answer_b=q_data['answer_b'],
                    answer_c=q_data['answer_c'],
                    answer_d=q_data['answer_d'],
                    correct_answer=q_data['correct_answer'],
                    explanation=q_data['explanation']
                )
            else:
                questions_crud.create_ot_question(
                    db=db,
                    chapter_id=chapter_id,
                    question=q_data['question'],
                    correct_answer=q_data['correct_answer']
                )


    async def create_course(self, user_id: str, course_id: int, request: CourseRequest, task_id: str):#, ws_manager: WebSocketConnectionManager):
        """
        Main function for handling the course creation logic. Uses WebSocket for progress.

        Parameters:
        user_id (str): The unique identifier of the user who is creating the course.
        request (CourseRequest): A CourseRequest object containing all necessary details for creating a new course.
        db (Session): The SQLAlchemy database session.
        task_id (str): The unique ID for this course creation task, used for WebSocket communication.
        #ws_manager (WebSocketConnectionManager): Manager to send messages over WebSockets.
        """
        course_db = None
        try:
            logger.info("[%s] Starting course creation for user %s", task_id, user_id)

            # Log at the beginning of the task -> prevent over usage of limit
            with get_db_context() as db:
                usage_crud.log_course_creation(
                    db=db,
                    user_id=user_id,
                    course_id=course_id,
                    detail=json.dumps(request.model_dump())
                )
                logger.info("[%s] Usage logged for course creation by user %s", task_id, user_id)



            # Create a memory session for the course creation
            session = await self.session_service.create_session(
                app_name=self.app_name,
                user_id=user_id,
                state={}
            )
            session_id = session.id
            logger.info("[%s] Session created: %s", task_id, session_id)

            # Retrieve documents from database
            with get_db_context() as db:
                docs: List[Document] = documents_crud.get_documents_by_ids(db, request.document_ids)
                images: List[Image] = images_crud.get_images_by_ids(db, request.picture_ids)
            
            logger.info("[%s] Retrieved %d documents and %d images.", task_id, len(docs), len(images))

            #Add Data to ChromaDB for RAG
            self.contentService.process_course_documents(
                course_id=course_id,
                documents=docs
            )

            # Get a short course title and description from the info_agent
            info_response = await self.info_agent.run(
                user_id=user_id,
                state={},
                content=self.query_service.get_info_query(request, docs, images,)
            )
            logger.info("[%s] InfoAgent response: %s", task_id, info_response['title'])

            # Get unsplash image url
            image_response = await self.image_agent.run(
                user_id=user_id,
                state={},
                content=create_text_query(
                    f"Title: {info_response['title']}, Description: {info_response['description']}")
            )

            # Update course in database
            with get_db_context() as db:
                course_db = courses_crud.update_course(
                    db=db,
                    course_id=course_id,
                    session_id=session_id,
                    title=info_response['title'],
                    description=info_response['description'],
                    image_url=image_response['explanation'],
                    total_time_hours=request.time_hours,
                )
                if not course_db:
                    raise ValueError(f"Failed to update course in DB for user {user_id} with course_id {course_id}")
            print(f"[{task_id}] Course updated in DB with ID: {course_id}")

            # Send Notification to WebSocket
            ###await ws_manager.send_json_message(task_id, {"type": "course_info", "data": "updating course info"})

            init_state = CourseState(
                query=request.query,
                time_hours=request.time_hours,
                language=request.language,
                difficulty=request.difficulty,
            )
            # Create initial state for the course
            self.state_manager.create_state(user_id, course_id, init_state)
            print(f"[{task_id}] Initial state created for course {course_id}.")

 
            # Bind documents to this course
            with get_db_context() as db:
                for doc in docs:
                    documents_crud.update_document(db, int(doc.id), course_id=course_id)
                for img in images:
                    images_crud.update_image(db, int(img.id), course_id=course_id)
            print(f"[{task_id}] Documents and images bound to course.")

            # Notify WebSocket about course info
            ###await ws_manager.send_json_message(task_id, {"type": "course_info", "data": course_info_data})
            ###print(f"[{task_id}] Sent course_info update.")

            # Query the planner agent
            response_planner = await self.planner_agent.run(
                user_id=user_id,
                state=self.state_manager.get_state(user_id=user_id, course_id=course_id),
                content=self.query_service.get_planner_query(request, docs, images),
                debug=True
            )
            if not response_planner or "chapters" not in response_planner:
                raise ValueError(f"PlannerAgent did not return valid chapters for user {user_id} with course_id {course_id}")
            print(f"[{task_id}] PlannerAgent responded with {len(response_planner.get('chapters', []))} chapters.")

            # Update course in database
            with get_db_context() as db:
                course_db = courses_crud.update_course(
                    db=db,
                    course_id=course_id,
                    chapter_count=len(response_planner["chapters"])
                )
            # Send notification to WebSocket that course info is being updated
            ###await ws_manager.send_json_message(task_id, {"type": "course_info", "data": "updating course info"})

            # Save chapters to state
            self.state_manager.save_chapters(user_id, course_id, response_planner["chapters"])

            async def process_chapter(idx: int, topic: dict):

                logger.info("[%s] Processing chapter %d: %s", task_id, idx + 1, topic['caption'])

                # Get RAG infos for the topic
                ragInfos = self.contentService.get_rag_infos(course_id, topic)

                # Schedule image and coding agents to run concurrently as they do not depend on each other
                coding_task = self.coding_agent.run(
                    user_id=user_id,
                    state=self.state_manager.get_state(user_id=user_id, course_id=course_id),
                    content=self.query_service.get_explainer_query(user_id, course_id, idx, request.language, request.difficulty, ragInfos),
                )

                image_task = self.image_agent.run(
                    user_id=user_id,
                    state={},
                    content=self.query_service.get_explainer_image_query(user_id, course_id, idx)
                )

                # Await both tasks to complete in parallel
                response_code, image_response = await asyncio.gather(
                    coding_task,
                    image_task
                )

                summary = "\n".join(topic['content'][:3])

                # Save the chapter in db first
                with get_db_context() as db:
                    chapter_db = chapters_crud.create_chapter(
                        db=db,
                        course_id=course_id,
                        index=idx + 1,
                        caption=topic['caption'],
                        summary=summary,
                        content=response_code['explanation'] if 'explanation' in response_code else "() => {<p>Something went wrong</p>}",
                        time_minutes=topic['time'],
                        image_url=image_response['explanation'],
                    )

                # Get response from tester agent
                response_tester = await self.tester_agent.run(
                    user_id=user_id,
                    state=self.state_manager.get_state(user_id=user_id, course_id=course_id),
                    content=self.query_service.get_tester_query(user_id, course_id, idx, response_code["explanation"], request.language, request.difficulty) 
                )

                logger.info("Finished")

                # Save questions in db
                with get_db_context() as db:
                    await self.save_questions(db, response_tester['questions'], chapter_db.id)
                
                return chapter_db

            # Process all chapters in parallel
            chapter_tasks = [
                process_chapter(idx, topic) 
                for idx, topic in enumerate(response_planner["chapters"])
            ]
            
            # Wait for all chapters to be processed
            await asyncio.gather(*chapter_tasks)

            # Update course status to finished
            with get_db_context() as db:
                courses_crud.update_course_status(db, course_id, CourseStatus.FINISHED)

            # Send completion signal
            #await ws_manager.send_json_message(task_id, {
            #    "type": "complete",
            #    "data": {"course_id": course_id, "message": "Course created successfully"}
            #})
            print(f"[{task_id}] Sent completion signal.")

        except Exception as _:
            
            error_message = f"Course creation failed: {str(traceback.format_exc())}"
            print(f"[{task_id}] Error during course creation: {error_message}")
            # Log detailed error traceback here if possible, e.g., import traceback; traceback.print_exc()
            if course_db:
                try:
                    with get_db_context() as db:
                        courses_crud.update_course_status(db, course_id, CourseStatus.FAILED)
                        courses_crud.update_course(db, course_id, error_msg=error_message)
                    print(f"[{task_id}] Course {course_id} status updated to FAILED due to error.")
                except Exception as db_error:
                    print(f"[{task_id}] Additionally, failed to update course status to FAILED: {db_error}")
            else:
                print(f"[{task_id}] No course_db to update status, error occurred before course creation.")
            #raise e
        
            #await ws_manager.send_json_message(task_id, {
            #    "type": "error",
            #    "data": {"message": error_message, "course_id": course_id if course_db else None}
            #})
            # Re-raise the exception if you want the background task to show as 'failed' in FastAPI logs
            # or if something upstream needs to handle it. For now, we handle it and inform client.
            # raise e

        finally:
            print(f"[{task_id}] Finished processing create_course background task.")
            # Ensure the database session is closed if it was passed specifically for this task
            # and not managed by FastAPI's Depends. For now, assuming Depends handles it.
            # db.close() # If db session is task-specific and not managed by Depends.

    async def grade_question(self, user_id: str, course_id: int, question: str, correct_answer: str, users_answer: str, 
                             chapter_id: int, db):
        """ Receives an open text question plus answer from the user and returns received points and short feedback """
        query = self.query_service.get_grader_query(question, correct_answer, users_answer)
        grader_response = await self.grader_agent.run(
            user_id=user_id,
            state=self.state_manager.get_state(user_id=user_id, course_id=course_id),
            content=query
        )

        # Log usage of grading
        usage_crud.log_usage(
            db=db,
            user_id=user_id,
            action="grade_question",
            course_id=course_id,
            chapter_id=chapter_id,
            details=json.dumps({
                "course_id": course_id,
                "question": question,
                "correct_answer": correct_answer,
                "users_answer": users_answer,
                "points": grader_response['points'],
                "explanation": grader_response['explanation']
            })
        )

        return grader_response['points'], grader_response['explanation']

