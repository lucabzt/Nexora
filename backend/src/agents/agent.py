"""
This file defines the base class for all agents.
"""
import json
from google.genai import types
from abc import ABC, abstractmethod
from typing import Dict, Any


class StandardAgent(ABC):
    """ This is the standard agent without structured output """
    @abstractmethod
    def __init__(self, app_name: str, session_service):
        pass

    async def run(self, user_id: str, session_id: str, content: types.Content, debug: bool = False) -> Dict[str, Any]:
        """
        Wraps the event handling and runner from adk into a simple run() method that includes error handling
        :param user_id: id of the user
        :param session_id: current session id
        :param content: the user query as a type.Content object
        :param debug: if true the method will print auxiliary outputs (all events)
        :return: the parsed dictionary response from the agent
        """
        # Key Concept: run_async executes the agent logic and yields Events
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
        pass

    async def run(self, user_id: str, session_id: str, content: types.Content, debug: bool = False) -> Dict[str, Any]:
        """
        Wraps the event handling and runner from adk into a simple run() method that includes error handling
        :param user_id: id of the user
        :param session_id: current session id
        :param content: the user query as a type.Content object
        :param debug: if true the method will print auxiliary outputs (all events)
        :return: the parsed dictionary response from the agent
        """

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
                        print(f"Raw response: {json_text}")
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