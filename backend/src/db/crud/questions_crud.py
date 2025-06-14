from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from ..models.db_course import MultipleChoiceQuestion, OpenTextQuestion

############### ALL QUESTIONS
def delete_questions_by_chapter(db: Session, chapter_id: int) -> int:
    """Delete all questions for a specific chapter. Returns number of deleted questions."""
    deleted_count_mc = db.query(MultipleChoiceQuestion).filter(
        MultipleChoiceQuestion.chapter_id == chapter_id
    ).delete()
    deleted_count_ot = db.query(OpenTextQuestion).filter(
        OpenTextQuestion.chapter_id == chapter_id
    ).delete()
    db.commit()
    return deleted_count_mc + deleted_count_ot


############### MULTIPLE CHOICE QUESTIONS
def get_question_by_id_mc(db: Session, question_id: int) -> Optional[MultipleChoiceQuestion]:
    """Get question by ID"""
    return db.query(MultipleChoiceQuestion).filter(MultipleChoiceQuestion.id == question_id).first()


def get_mc_questions_by_chapter_id(db: Session, chapter_id: int) -> List[MultipleChoiceQuestion]:
    """Get all questions for a specific chapter"""
    return db.query(MultipleChoiceQuestion).filter(MultipleChoiceQuestion.chapter_id == chapter_id).all()


def create_multiple_choice_question(db: Session, chapter_id: int, question: str, answer_a: str,
                                    answer_b: str, answer_c: str, answer_d: str, correct_answer: str,
                                    explanation: str) -> MultipleChoiceQuestion:
    """Create a new question"""
    db_question = MultipleChoiceQuestion(
        chapter_id=chapter_id,
        question=question,
        answer_a=answer_a,
        answer_b=answer_b,
        answer_c=answer_c,
        answer_d=answer_d,
        correct_answer=correct_answer,
        explanation=explanation
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question


def create_multiple_mc_questions(db: Session, chapter_id: int, questions_data: List[dict]) -> List[
    MultipleChoiceQuestion]:
    """Create multiple questions for a chapter at once"""
    db_questions = []
    for q_data in questions_data:
        db_question = MultipleChoiceQuestion(
            chapter_id=chapter_id,
            question=q_data['question'],
            answer_a=q_data['answer_a'],
            answer_b=q_data['answer_b'],
            answer_c=q_data['answer_c'],
            answer_d=q_data['answer_d'],
            correct_answer=q_data['correct_answer'],
            explanation=q_data['explanation']
        )
        db_questions.append(db_question)
        db.add(db_question)

    db.commit()
    for question in db_questions:
        db.refresh(question)
    return db_questions


def update_mc_question(db: Session, question_id: int, **kwargs) -> Optional[MultipleChoiceQuestion]:
    """Update question with provided fields"""
    question = db.query(MultipleChoiceQuestion).filter(MultipleChoiceQuestion.id == question_id).first()
    if question:
        for key, value in kwargs.items():
            if hasattr(question, key):
                setattr(question, key, value)
        db.commit()
        db.refresh(question)
    return question


def delete_mc_question(db: Session, question_id: int) -> bool:
    """Delete question by ID"""
    question = db.query(MultipleChoiceQuestion).filter(MultipleChoiceQuestion.id == question_id).first()
    if question:
        db.delete(question)
        db.commit()
        return True
    return False


############### OPEN TEXT QUESTIONS
def get_question_by_id_ot(db: Session, question_id: int) -> Optional[OpenTextQuestion]:
    """Get question by ID"""
    return db.query(OpenTextQuestion).filter(OpenTextQuestion.id == question_id).first()


def get_ot_questions_by_chapter_id(db: Session, chapter_id: int) -> List[OpenTextQuestion]:
    """Get all open text questions for a specific chapter"""
    return db.query(OpenTextQuestion).filter(OpenTextQuestion.chapter_id == chapter_id).all()


def create_open_text_question(db: Session, chapter_id: int, question: str,
                              correct_answer: str) -> OpenTextQuestion:
    """Create a new open text question"""
    db_question = OpenTextQuestion(
        chapter_id=chapter_id,
        question=question,
        correct_answer=correct_answer
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question


def create_multiple_ot_questions(db: Session, chapter_id: int, questions_data: List[dict]) -> List[
    OpenTextQuestion]:
    """Create multiple open text questions for a chapter at once"""
    db_questions = []
    for q_data in questions_data:
        db_question = OpenTextQuestion(
            chapter_id=chapter_id,
            question=q_data['question'],
            correct_answer=q_data['correct_answer']
        )
        db_questions.append(db_question)
        db.add(db_question)

    db.commit()
    for question in db_questions:
        db.refresh(question)
    return db_questions


def update_ot_question(db: Session, question_id: int, **kwargs) -> Optional[OpenTextQuestion]:
    """Update open text question with provided fields"""
    question = db.query(OpenTextQuestion).filter(OpenTextQuestion.id == question_id).first()
    if question:
        for key, value in kwargs.items():
            if hasattr(question, key):
                setattr(question, key, value)
        db.commit()
        db.refresh(question)
    return question


def delete_ot_question(db: Session, question_id: int) -> bool:
    """Delete open text question by ID"""
    question = db.query(OpenTextQuestion).filter(OpenTextQuestion.id == question_id).first()
    if question:
        db.delete(question)
        db.commit()
        return True
    return False
