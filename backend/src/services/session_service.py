from typing import Dict, Optional
from google.adk.sessions import InMemorySessionService
import asyncio

class UserSessionService:
    """Manages AI agent sessions per user"""
    
    def __init__(self):
        self._user_sessions: Dict[int, InMemorySessionService] = {}
        self._app_name = "TeachAI"
    
    def get_session_service(self, user_id: int) -> InMemorySessionService:
        """Get or create session service for a user"""
        if user_id not in self._user_sessions:
            self._user_sessions[user_id] = InMemorySessionService()
        return self._user_sessions[user_id]
    
    async def create_user_session(self, user_id: int) -> str:
        """Create a new session for a user"""
        session_service = self.get_session_service(user_id)
        session = await session_service.create_session(
            app_name=self._app_name,
            user_id=str(user_id),
            state={}
        )
        return session.id
    
    def cleanup_user_sessions(self, user_id: int):
        """Clean up sessions for a user (call on logout)"""
        if user_id in self._user_sessions:
            del self._user_sessions[user_id]

# Global instance
user_session_service = UserSessionService()