"""
This file defines the service that coordinates the interaction between all the agents
"""
import json

from sqlalchemy.orm import Session

from .query_service import QueryService
from .state_service import StateService, CourseState
from ..db.crud import chapters_crud, documents_crud, images_crud, questions_crud, courses_crud


from google.adk.sessions import InMemorySessionService

from ..agents.planner_agent import PlannerAgent
from ..agents.explainer_agent import ExplainerAgent
from ..agents.info_agent.agent import InfoAgent
from ..agents.tester_agent import TesterAgent
from ..agents.utils import create_text_query, create_docs_query
from ..db.models.db_course import CourseStatus
from ..api.schemas.course import CourseRequest


class AgentService:
    def __init__(self):
        
        # session
        self.session_service = InMemorySessionService()
        self.app_name = "Nexora"
        self.state_manager = StateService()
        self.query_service = QueryService(self.state_manager)
        
        # define agents
        self.planner_agent = PlannerAgent(self.app_name, self.session_service)
        self.explainer_agent = ExplainerAgent(self.app_name, self.session_service)
        self.tester_agent = TesterAgent(self.app_name, self.session_service)
        self.info_agent = InfoAgent(self.app_name, self.session_service)


    async def create_course(self, user_id: str, request: CourseRequest, db: Session):
        """
        main function for handling the course creation logic.

        Parameters:
        user_id (str): The unique identifier of the user who is creating the course.
        request (CourseRequest): A CourseRequest object containing all necessary details for
            creating a new course.

        Yields JSON chunks in the format:
        {"type": "course_info", "data": {...}}
        {"type": "chapter", "data": {...}}
        {"type": "error", "data": {"message": "..."}}
        {"type": "complete", "data": {}}
        """
        # create a memory session for the course creation
        session = await self.session_service.create_session(
            app_name=self.app_name,
            user_id=user_id,
            state={}
        )
        session_id = session.id

        # retrieve documents from database
        docs = documents_crud.get_documents_by_ids(db, request.document_ids)
        images = images_crud.get_images_by_ids(db, request.picture_ids)

        # get a short course title and description from the quick agent
        info_response = await self.info_agent.run(
            user_id=user_id,
            state={},
            content=self.query_service.get_info_query(request, docs, images)
        )

        # Create course in database
        course_db = courses_crud.create_course(
            db=db,
            session_id=session_id,
            user_id=user_id,
            title=info_response['title'],
            description=info_response['description'],
            total_time_hours=request.time_hours,
            status=CourseStatus.CREATING
        )

        # Create initial state
        init_state = CourseState(
            query=request.query,
            time_hours=request.time_hours,
        )
        self.state_manager.create_state(user_id, course_db.id, init_state)

        # bind documents to this course
        for doc in docs:
            documents_crud.update_document(db, int(doc.id), course_id=course_db.id)
        for img in images:
            images_crud.update_image(db, int(img.id), course_id=course_db.id)

        # Stream the course info first
        course_info = {
            "course_id": course_db.id,
            "title": course_db.title,
            "description": course_db.description,
            "session_id": course_db.session_id,
            "total_time_hours": course_db.total_time_hours
        }

        yield json.dumps({"type": "course_info", "data": course_info}) + "\n"

        # Query the planner agent (returns a dict)
        response_planner = await self.planner_agent.run(
            user_id=user_id,
            state=self.state_manager.get_state(user_id=user_id, course_id=course_db.id),
            content=self.query_service.get_planner_query(request, docs, images),
            debug=False
        )

        # Save chapters to state
        self.state_manager.save_chapters(user_id, course_db.id, response_planner["chapters"])

        # Process each chapter and stream as it's created
        for idx, topic in enumerate(response_planner["chapters"]):
            # Get response from explainer agent
            response_explainer = await self.explainer_agent.run(
                user_id=user_id,
                state=self.state_manager.get_state(user_id=user_id, course_id=course_db.id),
                content=self.query_service.get_explainer_query(user_id, course_db.id, idx),
            )

            # Get response from tester agent
            response_tester = await self.tester_agent.run(
                user_id=user_id,
                state=self.state_manager.get_state(user_id=user_id, course_id=course_db.id),
                content=self.query_service.get_tester_query(user_id, course_db.id, idx, response_explainer["explanation"]),
            )

            # Save the chapter in db first
            chapter_db = chapters_crud.create_chapter(
                db=db,
                course_id=course_db.id,
                index=idx + 1,
                caption=topic['caption'],
                summary=json.dumps(topic['content'], indent=2),
                content=response_explainer['explanation'],
                time_minutes=topic['time'],
            )

            # Save questions in db
            question_objects = []
            for question in response_tester['questions']:
                q = questions_crud.create_question(
                    db=db,
                    chapter_id=int(chapter_db.id),
                    question=question['question'],
                    answer_a=question['answer_a'],
                    answer_b=question['answer_b'],
                    answer_c=question['answer_c'],
                    answer_d=question['answer_d'],
                    correct_answer=question['correct_answer'],
                    explanation=question['explanation']
                )
                question_objects.append({
                    "question": q.question,
                    "answer_a": q.answer_a,
                    "answer_b": q.answer_b,
                    "answer_c": q.answer_c,
                    "answer_d": q.answer_d,
                    "correct_answer": q.correct_answer,
                    "explanation": q.explanation
                })

            # Build chapter response
            chapter_data = {
                "id": chapter_db.id,
                "index": chapter_db.index,
                "caption": chapter_db.caption,
                "summary": chapter_db.summary,
                "content": chapter_db.content,
                "mc_questions": question_objects,
                "time_minutes": chapter_db.time_minutes,
                "is_completed": chapter_db.is_completed
            }

            # Stream the chapter
            yield json.dumps({"type": "chapter", "data": chapter_data}) + "\n"

        # Update course status to finished
        courses_crud.update_course_status(db, course_db.id, CourseStatus.FINISHED)

        # Send completion signal
        yield json.dumps({"type": "complete", "data": {}}) + "\n"




