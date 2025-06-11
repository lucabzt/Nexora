"""
This file defines the base class for all agents.
"""
import json
from google.genai import types
from abc import ABC, abstractmethod
from typing import Dict, Any


import logging
#logging.getLogger("google_adk.google.adk.models.google_llm").setLevel(logging.WARNING)



class StandardAgent(ABC):
    """ This is the standard agent without structured output """
    @abstractmethod
    def __init__(self, app_name: str, session_service):
        self.app_name = app_name
        self.session_service = session_service

    async def run(self, user_id: str, state: dict, content: types.Content, debug: bool = False) -> Dict[str, Any]:
        """
        Wraps the event handling and runner from adk into a simple run() method that includes error handling
        :param user_id: id of the user
        :param state: the state created from the StateService
        :param content: the user query as a type.Content object
        :param debug: if true the method will print auxiliary outputs (all events)
        :return: the parsed dictionary response from the agent
        """

        if debug:
            print("[Debug] Running agent with state: " + json.dumps(state, indent=2))

        # Create session
        session = await self.session_service.create_session(
            app_name=self.app_name,
            user_id=user_id,
            state=state
        )
        session_id = session.id


        # We iterate through events to find the final answer
        async for event in self.runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
            # You can set debug true to see all events during execution
            if debug:
                print(f"  [Event] Author: {event.author}, Type: {type(event).__name__}, Final: {event.is_final_response()}, Content: {event.content}")

            # is_final_response() marks the concluding message for the turn
            if event.is_final_response():
                if event.content and event.content.parts:
                    # Assuming text response in the first part
                    return {
                        "status": "success",
                        "explanation": event.content.parts[0].text # TODO rename to output/content
                    }
                elif event.actions and event.actions.escalate:  # Handle potential errors/escalations
                    return {
                        "status": "error",
                        "message": f"Agent escalated: {event.error_message or 'No specific message.'}"
                    }

        return {
            "status": "error",
            "message": "agent did not give a final respond. unknown error occurred",
        }


class StructuredAgent(ABC):
    """ This is an agent that returns structured output. """
    @abstractmethod
    def __init__(self, app_name: str, session_service):
        self.app_name = app_name
        self.session_service = session_service

    async def run(self, user_id: str, state: dict, content: types.Content, debug: bool = False) -> Dict[str, Any]:
        """
        Wraps the event handling and runner from adk into a simple run() method that includes error handling
        :param user_id: id of the user
        :param state: the state created from the StateService
        :param content: the user query as a type.Content object
        :param debug: if true the method will print auxiliary outputs (all events)
        :return: the parsed dictionary response from the agent
        """
        session = await self.session_service.create_session(
            app_name=self.app_name,
            user_id=user_id,
            state=state
        )
        session_id = session.id

        async for event in self.runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=content
        ):
            if debug:
                print(f"[Event] Author: {event.author}, Type: {type(event).__name__}, "
                      f"Final: {event.is_final_response()}")

            if event.is_final_response():
                if event.content and event.content.parts:
                    # Get the text from the Part object
                    json_text = event.content.parts[0].text

                    # Try parsing the json response into a dictionary
                    try:
                        dict_response = json.loads(json_text)
                        dict_response['status'] = 'success'
                        return dict_response
                    except json.JSONDecodeError as e:
                        print(f"Error parsing JSON response: {e}")
                        ### ### ### print(f"Raw response: {json_text}")
                        raise
                elif event.actions and event.actions.escalate:  # Handle potential errors/escalations
                    return {
                        "status": "error",
                        "message": f"Agent escalated: {event.error_message or 'No specific message.'}"
                    }
        return {
            "status": "error",
            "message": "agent did not give a final respond. unknown error occurred",
        }