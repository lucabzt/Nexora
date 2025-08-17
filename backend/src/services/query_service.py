"""
Utility class to get the queries for all the agents
As the queries are very text heavy, I do not want to build them up in the agent or state service.
"""
import json
import fitz #pymupdf

from ..agents.utils import create_text_query, create_docs_query


class QueryService:
    def __init__(self, state_manager):
        self.sm = state_manager

    @staticmethod
    def get_grader_query(question: str, correct_answer: str, users_answer: str):
        query = f"""
Practice Question: {question}
Correct Answer: {correct_answer}
User Answer: {users_answer}
"""
        return create_text_query(query)


    def get_tester_query(self, user_id: str, course_id: int, chapter_idx: int, explanation: str, language: str, difficulty: str):
        chapter = self.sm.get_state(user_id, course_id)['chapters'][chapter_idx]
        pretty_chapter = \
        f"""
        Title: {chapter["caption"]}
        Time for Chapter: {chapter["time"]} minutes
        Full Chapter Content (React): \n{json.dumps(explanation, indent=2)}
        Response Language: {language}
        Response Difficulty: {difficulty}
        """
        return create_text_query(pretty_chapter)


    def get_explainer_query(self, user_id, course_id, chapter_idx, language: str, difficulty: str, ragInfos: list):
        chapter = self.sm.get_state(user_id, course_id)['chapters'][chapter_idx]
        pretty_chapter = \
            f"""
                Chapter {chapter_idx + 1}:
                Caption: {chapter['caption']}
                Time in Minutes: {chapter['time']}
                Content Summary: \n{json.dumps(chapter['content'], indent=2)}
                Note by Planner Agent: {json.dumps(chapter['note'], indent=2)}
                Response Language: {language}
                Response Difficulty: {difficulty}

                The following additional information was uploaded by the User. 
                He does not have access to it so please explain what you are referring to,
                {json.dumps(ragInfos, indent=2)}
            """
        return create_text_query(pretty_chapter)

    def get_explainer_image_query(self, user_id, course_id, chapter_idx):
        chapter = self.sm.get_state(user_id, course_id)['chapters'][chapter_idx]
        pretty_chapter = \
            f"""
                Caption: {chapter['caption']}
                Content Summary: \n{json.dumps(chapter['content'], indent=2)}
                Note by Planner Agent: {json.dumps(chapter['note'], indent=2)}
            """
        return create_text_query(pretty_chapter)

    @staticmethod
    def get_info_query(request, docs, images):
        """Get the query for the info agent"""
        doc_data = []
        text_extensions = {'.txt', '.md', '.py', '.js', '.html', '.css', '.json', '.xml', '.csv', '.yaml', '.yml'}

        for doc in docs:
            ext = doc.filename.lower().split('.')[-1] if '.' in doc.filename else ''

            try:
                if doc.filename.lower().endswith('.pdf'):
                    pdf_doc = fitz.open(stream=doc.file_data, filetype="pdf")
                    text = "".join(page.get_text() for page in pdf_doc)
                    pdf_doc.close()
                elif f'.{ext}' in text_extensions:
                    text = doc.file_data.decode('utf-8', errors='ignore')
                else:
                    continue  # Skip non-text files

                lines = text.strip().splitlines()[:10]
                doc_data.append(f"{doc.filename}:\n" + "\n".join(lines))

            except Exception as e:
                print(f"Error processing {doc.filename}: {e}")

        print("EIERLECKER" + json.dumps(doc_data, indent=2))
        return create_text_query(
        f"""
            The following is the user query for creating a course / learning path:
            {request.query}
            The users uploaded the following documents:
            {json.dumps(doc_data, indent=2)}
            {[img.filename for img in images]}
            Response Language: {request.language}
            Response Difficulty: {request.difficulty}
        """)

    @staticmethod
    def get_planner_query(request, docs, images):
        # query for the planner agent
        planner_query = \
        f"""
            Question (System): What do you want to learn?
            Answer (User): \n{request.query}
            Question (System): How many hours do you want to invest?
            Answer (User): {request.time_hours}
            Question (System): What language do you want to learn?
            Answer (User): {request.language}
            Question (System): What difficulty do you want to learn?
            Answer (User): {request.difficulty}
        """
        return create_docs_query(planner_query, docs, images)
