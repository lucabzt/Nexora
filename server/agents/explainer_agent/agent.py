"""
This defines a ExplainerAgent class which wraps the event handling,
runner from adk and calls to visualizer agent into a simple run() method
"""
from google.adk.agents import LlmAgent
from google.adk.runners import Runner

from ..utils import load_instruction_from_file   


class ExplainerAgent:
    def __init__(self, app_name: str, session_service):
        # Create the planner agent
        explainer_agent = LlmAgent(
            name="explainer_agent",
            model="gemini-2.5-flash-preview-05-20",
            description="Agent for creating engaging and simple explanations for complex topics",
            instruction=load_instruction_from_file("explainer_agent/instructions.txt"),
        )

        # Assign attributes
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
            agent=explainer_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )

    async def run(self, user_id, session_id, content, debug=False):
        """
        Wraps the event handling and runner from adk into a simple run() method to get the final response only
        :param user_id: id of the user
        :param session_id: current session id
        :param content: the user query, created with types.Part
        :param debug: if true the method will print auxiliary outputs (all events)
        :return: the final response of the planner agent
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
                        "explanation": event.content.parts[0].text
                    }
                elif event.actions and event.actions.escalate:  # Handle potential errors/escalations
                    print("ERROR 1 IN EXPLAINER AGENT, PLEASE HANDLE")
                    return {
                        "status": "error",
                        "message": f"Agent escalated: {event.error_message or 'No specific message.'}"
                    }

        print("ERROR 2 IN EXPLAINER AGENT, PLEASE HANDLE")
        return {
            "status": "error",
            "message": "agent did not give a final respond. unknown error occurred",
        }
