from abc import ABC, abstractmethod
from typing import Dict, Any
from google.genai import types

class BaseAgent(ABC):
    """Base class for all AI agents"""
    
    def __init__(self, app_name: str, session_service):
        self.app_name = app_name
        self.session_service = session_service
    
    @abstractmethod
    async def run(
        self, 
        user_id: str, 
        session_id: str, 
        content: types.Content, 
        debug: bool = False
    ) -> Dict[str, Any]:
        """Abstract method that all agents must implement"""
        pass