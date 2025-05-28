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
from ..agents.utils import create_text_query
from ..models.db_course import CourseStatus
from ..schemas.course import CourseRequest


class AgentService:
    def __init__(self):
        
        # session
        self.session_service = InMemorySessionService()
        self.app_name = "Nexora"
        
        # define agents
        self.planner_agent = PlannerAgent(self.app_name, self.session_service)
        self.explainer_agent = ExplainerAgent(self.app_name, self.session_service)
        self.tester_agent = TesterAgent(self.app_name, self.session_service)
        self.info_agent = InfoAgent(self.app_name)


    async def create_course(self, user_id: str, request: CourseRequest, db: Session):
        """
        main function for handling the course creation logic.

        Parameters:
        user_id (str): The unique identifier of the user who is creating the course.
        request (CourseRequest): A CourseRequest object containing all necessary details for
            creating a new course.
        """
        # create a memory session for the course creation (not needed afterward)
        session = await self.session_service.create_session(
            app_name=self.app_name,
            user_id=user_id,
            state={}
        )
        session_id = session.id

        # get a short course title and description from the quick agent TODO add the document context here somehow
        info_query = create_text_query(f"""
        The following is the user query for creating a course / learning path:
        {request.query}
        """)
        info_response = await self.info_agent.run(user_id, session_id, info_query)
        course_db = crud.create_course(
            db=db,
            session_id=session_id,
            user_id=user_id,
            title=info_response['title'],
            description=info_response['description'],
            total_time_hours=request.time_hours,
            status=CourseStatus.CREATING
        )

        # query for the planner agent
        planner_query = f"""
                        Question (System): What do you want to learn?
                        Answer (User): \n{request.query}
                        Question (System): How many hours do you want to invest?
                        Answer (User): {request.time_hours}
                    """
        content = create_text_query(planner_query)

        # Query the planner agent (returns a dict)
        response_planner = await self.planner_agent.run(
            user_id=user_id,
            session_id=session_id,
            content=content,
            debug=False
        )

        response = {
            "status": "success",
            "chapters": []
        }

        # TODO add error handling for status: error
        # Enumerate chapters from planner agent and give to explainer and tester agent
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

            # Get response from explainer agent
            response_tester = await self.tester_agent.run(
                user_id=user_id,
                session_id=session_id,
                content=create_text_query(pretty_chapter),
            )

            # Build up response
            chapter = {
                "index": idx + 1,
                "caption": topic['caption'],
                "summary": json.dumps(topic['content'], indent=2),
                "content": response_explainer['explanation'],
                "mc_questions": response_tester['questions'],
                "time": topic['time']
            }

            # TODO change to streaming
            response["chapters"].append(chapter)

            # Save the chapter in db
            chapter_db = crud.create_chapter(
                db=db,
                course_id=course_db.id,
                index=idx,
                caption=chapter['caption'],
                summary=chapter['summary'],
                content=chapter['content'],
                time_minutes=chapter['time'],
            )

            # Save questions in db
            for question in response_tester['questions']:
                crud.create_question(
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

        return response



    
    