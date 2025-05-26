from typing import Dict, Any, List
import json
from ..agents.planner.agent import PlannerAgent
from ..agents.explainer.agent import ExplainerAgent  
from ..agents.tester.agent import TesterAgent
from ..agents.utils import create_text_query
from .session_service import user_session_service

class AgentService:
    """Orchestrates AI agents for course creation"""
    
    def __init__(self):
        self.app_name = "TeachAI"
    
    async def create_course(
        self, 
        user_id: int, 
        query: str, 
        time_hours: int
    ) -> Dict[str, Any]:
        """Main method to create a complete course"""
        
        # Get user's session service
        session_service = user_session_service.get_session_service(user_id)
        
        # Create new session for this course creation
        session_id = await user_session_service.create_user_session(user_id)
        
        # Initialize agents
        planner = PlannerAgent(self.app_name, session_service)
        explainer = ExplainerAgent(self.app_name, session_service)
        tester = TesterAgent(self.app_name, session_service)
        
        # Create planner query
        content = create_text_query(f"""
            Question (System): What do you want to learn?
            Answer (User): {query}
            Question (System): How many hours do you want to invest?
            Answer (User): {time_hours}
        """)
        
        # Get learning path from planner
        planner_response = await planner.run(
            user_id=str(user_id),
            session_id=session_id,
            content=content,
            debug=False
        )
        
        if planner_response.get("status") != "success":
            return {"status": "error", "message": "Planning failed"}
        
        # Process each chapter
        chapters = []
        for idx, topic in enumerate(planner_response["chapters"]):
            
            # Create chapter content
            chapter_data = await self._create_chapter(
                user_id, session_id, idx, topic, explainer, tester
            )
            chapters.append(chapter_data)
        
        return {
            "status": "success",
            "chapters": chapters,
            "session_id": session_id
        }
    
    async def _create_chapter(
        self, 
        user_id: int, 
        session_id: str, 
        idx: int,
        topic: Dict,
        explainer: ExplainerAgent,
        tester: TesterAgent
    ) -> Dict[str, Any]:
        """Create content and questions for a single chapter"""
        
        # Prepare topic for explainer
        pretty_topic = f"""
            Chapter {idx + 1}:
            Caption: {topic['caption']}
            Time in Minutes: {topic['time']}
            Content Summary: {json.dumps(topic['content'], indent=2)}
            Note by Planner Agent: {json.dumps(topic.get('note', ''), indent=2)}
        """
        
        # Get explanation
        explainer_response = await explainer.run(
            user_id=str(user_id),
            session_id=session_id,
            content=create_text_query(pretty_topic)
        )
        
        # Prepare full chapter for tester
        full_chapter = f"""
            {pretty_topic}
            Full Content: {json.dumps(explainer_response.get('explanation', ''), indent=2)}
        """
        
        # Get test questions
        tester_response = await tester.run(
            user_id=str(user_id),
            session_id=session_id,
            content=create_text_query(full_chapter)
        )
        
        return {
            "index": idx + 1,
            "caption": topic['caption'],
            "summary": json.dumps(topic['content'], indent=2),
            "content": explainer_response.get('explanation', ''),
            "mc_questions": tester_response.get('questions', []),
            "time_minutes": topic.get('time', 0)
        }

# Global instance
agent_service = AgentService()