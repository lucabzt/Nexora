from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...db.database import get_db
from ..schemas.questions import QuestionResponse
from ...db.crud import questions_crud
from ...db.models.db_course import Chapter, PracticeQuestion
from ...db.models.db_user import User
from ...utils.auth import get_current_active_user
from ...services.course_service import verify_course_ownership
from .courses import agent_service



router = APIRouter(
    prefix="/chapters",
    tags=["chapters"],
    responses={404: {"description": "Not found"}},
)

def get_practice_questions(questions: List[PracticeQuestion]) -> List[QuestionResponse]:
    """
    Helper function to convert list of PracticeQuestion objects to list of QuestionResponse objects.
    """
    return [
        QuestionResponse(
            id=q.id,
            type=q.type,
            question=q.question,
            answer_a=q.answer_a,
            answer_b=q.answer_b,
            answer_c=q.answer_c,
            answer_d=q.answer_d,
            correct_answer=q.correct_answer,
            explanation=q.explanation,
            users_answer=q.users_answer,
            points_received=q.points_received,
            feedback=q.feedback
        ) for q in questions
    ]


@router.get("/{course_id}/chapters/{chapter_id}", response_model=List[QuestionResponse])
async def get_questions_by_chapter_id(
        course_id: int,
        chapter_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    course = await verify_course_ownership(course_id, str(current_user.id), db)
    # Find the specific chapter
    chapter = (db.query(Chapter)
               .filter(Chapter.id == chapter_id, Chapter.course_id == course_id)
               .first())

    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found in this course"
        )
    if not chapter.questions:
        return []

    return get_practice_questions(chapter.questions)

@router.get("/{course_id}/chapters/{chapter_id}/{question_id}/save", response_model=QuestionResponse)
async def save_answer(
        course_id: int,
        chapter_id: int,
        question_id: int,
        users_answer: str,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """ Save a user's answer to a question. Also saves user answer plus feedback in the database. """
    course = await verify_course_ownership(course_id, str(current_user.id), db)

    # Find the question first
    question = (db.query(PracticeQuestion)
                .filter(PracticeQuestion.id == question_id)
                .first())

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    # Update question in db
    questions_crud.update_question(
        db,
        question_id,
        users_answer=users_answer
    )

    # Refresh question from db to get updated data
    db.refresh(question)

    # Return the updated question as QuestionResponse
    return QuestionResponse(
        id=question.id,
        type=question.type,
        question=question.question,
        answer_a=question.answer_a,
        answer_b=question.answer_b,
        answer_c=question.answer_c,
        answer_d=question.answer_d,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        users_answer=question.users_answer,
        points_received=question.points_received,
        feedback=question.feedback
    )

@router.get("/{course_id}/chapters/{chapter_id}/{question_id}/feedback", response_model=QuestionResponse)
async def get_feedback(
    course_id: int,
    chapter_id: int,
    question_id: int,
    users_answer: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """ Get feedback on an open text question. Also saves user answer plus feedback in the database. """
    course = await verify_course_ownership(course_id, str(current_user.id), db)

    # Find the question
    question = (db.query(PracticeQuestion)
                .filter(question_id == PracticeQuestion.id)
                .first())

    # Get feedback from grader
    points, feedback = await agent_service.grade_question(
        user_id=current_user.id,
        course_id=course_id,
        question=question.question,
        correct_answer=question.correct_answer,
        users_answer=users_answer,
        chapter_id=chapter_id,
        db=db
    )

    # Update question in db
    questions_crud.update_question(
        db,
        question_id,
        users_answer=users_answer,
        points_received=points,
        feedback=feedback,
    )

    return QuestionResponse(
        id=question_id,
        type=question.type,
        question=question.question,
        answer_a=question.answer_a,
        answer_b=question.answer_b,
        answer_c=question.answer_c,
        answer_d=question.answer_d,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        users_answer=question.users_answer,
        points_received=question.points_received,
        feedback=question.feedback
    )



