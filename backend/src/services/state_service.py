"""
This class is used to control and update the state for the adk agents
In short, the StateService Object controls, what agent sees what information.
Why do we need this?
By default, adk adds the conversation history to each agent call. As the conversation history
for course creation can get very very long, we instantiate a new session for each agent request. However,
this creates the problem that agent a does not know what agent b does. That is why we use a state manager.
In addition, this class probides all the polished queries to the agents
"""
import json
from collections import defaultdict
from typing import Dict, List, Any, Optional

from pydantic import BaseModel

from ..agents.utils import create_text_query, create_docs_query


class CourseState(BaseModel):
    query: str = ""
    time_hours: int = 0
    chapters: List[Dict[str, Any]] = []
    chapters_str: str = ""     # only important for explainer as unnecessary info (e.g. idx, time_hours) is cut off
    code: str = ""
    errors: str = ""
    language: str ="English"
    difficulty: str ="Intermediate"


class StateService:
    def __init__(self):
        # The state is a hashmap that maps from the user id to another hashmap that maps from a course id to the state of the course.
        self.state: Dict[str, Dict[int, CourseState]] = defaultdict(dict)

    def save_chapters(self, user_id: str, course_id: int, chapters: List[Dict[str, Any]]) -> None:
        """
        Save newly created chapters to state for agents to use
        """
        self.state[user_id][course_id].chapters.extend(chapters)
        for idx, chapter in enumerate(chapters):
            chapter_str = \
            f"""
            \n
            Caption: {chapter['caption']}
            Content Summary: \n{json.dumps(chapter['content'], indent=2)}
            """
            self.state[user_id][course_id].chapters_str += chapter_str

    def get_state(self, user_id: str, course_id: int) -> dict[str, Any]:
        print(f"Getting state for user {user_id} and course {course_id}")
        try:
            return self.state[user_id][course_id].model_dump()
        except KeyError:
            return CourseState().model_dump()

    def create_state(self, user_id: str, course_id: int, state: CourseState):
        self.state[user_id][course_id] = state

    def update_state(self, user_id: str, course_id: int, **updates) -> None:
        """
        Update a state with the keys given in **update

        Args:
            user_id: The user identifier
            course_id: The course identifier
            **updates: Keyword arguments for the fields to update
        """
        # Check if user exists, if not create empty dict
        if user_id not in self.state:
            self.state[user_id] = {}

        # Check if course exists for user, if not create default CourseState
        if course_id not in self.state[user_id]:
            self.state[user_id][course_id] = CourseState()

        # Get current state as dict
        current_state_dict = self.state[user_id][course_id].model_dump()

        # Update with new values
        current_state_dict.update(updates)

        # Create new CourseState with validation
        self.state[user_id][course_id] = CourseState(**current_state_dict)

