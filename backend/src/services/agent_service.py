"""
This file defines the service that coordinates the interaction between all the agents
"""
import json

from sqlalchemy.orm import Session
from ..db import crud

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
        documents = crud.get_documents_by_ids(db, request.document_ids)
        images = crud.get_images_by_ids(db, request.picture_ids)

        # get a short course title and description from the quick agent
        info_query = create_text_query(f"""
                    The following is the user query for creating a course / learning path:
                    {request.query}
                    The users uploaded the following documents:
                    {[doc.filename for doc in documents]}
                    {[img.filename for img in images]}
                    """)
        info_response = await self.info_agent.run(user_id, session_id, info_query)

        # Create course in database
        course_db = crud.create_course(
            db=db,
            session_id=session_id,
            user_id=user_id,
            title=info_response['title'],
            description=info_response['description'],
            total_time_hours=request.time_hours,
            status=CourseStatus.CREATING
        )

        # bind documents to this course
        for doc in documents:
            crud.update_document(db, doc.id, course_id=course_db.id)
        for img in images:
            crud.update_image(db, img.id, course_id=course_db.id)

        # Stream the course info first
        course_info = {
            "course_id": course_db.id,
            "title": course_db.title,
            "description": course_db.description,
            "session_id": course_db.session_id,
            "total_time_hours": course_db.total_time_hours
        }

        yield json.dumps({"type": "course_info", "data": course_info}) + "\n"

        # query for the planner agent
        planner_query = f"""
                                    Question (System): What do you want to learn?
                                    Answer (User): \n{request.query}
                                    Question (System): How many hours do you want to invest?
                                    Answer (User): {request.time_hours}
                                """
        content = create_docs_query(planner_query, documents, images)

        # Query the planner agent (returns a dict)
        response_planner = await self.planner_agent.run(
            user_id=user_id,
            session_id=session_id,
            content=content,
            debug=False
        )

        # Process each chapter and stream as it's created
        for idx, topic in enumerate(response_planner["chapters"]):
            # Create input to explainer agent
            pretty_topic = f"""
                                    Chapter {idx + 1}:
                                    Caption: {topic['caption']}
                                    Time in Minutes: {topic['time']}
                                    Content Summary: \n{json.dumps(topic['content'], indent=2)}
                                    Note by Planner Agent: {json.dumps(topic['note'], indent=2)}
                                """

            # Get response from explainer agent
            response_explainer = await self.explainer_agent.run(
                user_id=user_id,
                session_id=session_id,
                content=create_text_query(pretty_topic),
            )

            # Create input to tester agent
            pretty_chapter = f"""
                                    {pretty_topic}
                                    Full Content: \n{json.dumps(response_explainer['explanation'], indent=2)}
                            """

            # Get response from tester agent
            response_tester = await self.tester_agent.run(
                user_id=user_id,
                session_id=session_id,
                content=create_text_query(pretty_chapter),
            )

            # Save the chapter in db first
            chapter_db = crud.create_chapter(
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
                q = crud.create_question(
                    db=db,
                    chapter_id=chapter_db.id,
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
        crud.update_course_status(db, course_db.id, CourseStatus.FINISHED)

        # Send completion signal
        yield json.dumps({"type": "complete", "data": {}}) + "\n"




