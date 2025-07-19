# backend/src/db/crud/flashcards_crud.py
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional
from datetime import datetime, timedelta
from ..models.db_flashcard import (
    FlashcardDeck, PDFChapter, Flashcard, FlashcardReview,
    ChapterSegmentationMode, FlashcardDifficulty
)


############### FLASHCARD DECKS
def create_deck(db: Session, user_id: str, title: str, description: str = None,
                course_id: int = None, source_pdf_id: int = None,
                segmentation_mode: ChapterSegmentationMode = None) -> FlashcardDeck:
    """Create a new flashcard deck"""
    deck = FlashcardDeck(
        user_id=user_id,
        title=title,
        description=description,
        course_id=course_id,
        source_pdf_id=source_pdf_id,
        segmentation_mode=segmentation_mode
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return deck


def get_deck_by_id(db: Session, deck_id: int) -> Optional[FlashcardDeck]:
    """Get deck by ID"""
    return db.query(FlashcardDeck).filter(FlashcardDeck.id == deck_id).first()


def get_decks_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[FlashcardDeck]:
    """Get all decks for a user"""
    return (db.query(FlashcardDeck)
            .filter(FlashcardDeck.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all())


def update_deck(db: Session, deck_id: int, **kwargs) -> Optional[FlashcardDeck]:
    """Update deck with provided fields"""
    deck = db.query(FlashcardDeck).filter(FlashcardDeck.id == deck_id).first()
    if deck:
        for key, value in kwargs.items():
            if hasattr(deck, key):
                setattr(deck, key, value)
        db.commit()
        db.refresh(deck)
    return deck


def delete_deck(db: Session, deck_id: int) -> bool:
    """Delete deck and all associated flashcards"""
    deck = db.query(FlashcardDeck).filter(FlashcardDeck.id == deck_id).first()
    if deck:
        db.delete(deck)
        db.commit()
        return True
    return False


############### PDF CHAPTERS
def create_pdf_chapter(db: Session, deck_id: int, chapter_number: int, title: str,
                       start_page: int, end_page: int, extracted_text: str = None,
                       summary: str = None, detection_confidence: float = 0.0,
                       detection_metadata: dict = None) -> PDFChapter:
    """Create a new PDF chapter"""
    chapter = PDFChapter(
        deck_id=deck_id,
        chapter_number=chapter_number,
        title=title,
        start_page=start_page,
        end_page=end_page,
        extracted_text=extracted_text,
        summary=summary,
        detection_confidence=detection_confidence,
        detection_metadata=detection_metadata
    )
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter


def get_pdf_chapters_by_deck(db: Session, deck_id: int) -> List[PDFChapter]:
    """Get all PDF chapters for a deck"""
    return db.query(PDFChapter).filter(PDFChapter.deck_id == deck_id).all()


############### FLASHCARDS
def create_flashcard(db: Session, deck_id: int, front: str, back: str,
                     pdf_chapter_id: int = None, difficulty: FlashcardDifficulty = FlashcardDifficulty.MEDIUM,
                     source_slide_numbers: str = None, auto_generated: bool = False) -> Flashcard:
    """Create a new flashcard"""
    flashcard = Flashcard(
        deck_id=deck_id,
        front=front,
        back=back,
        pdf_chapter_id=pdf_chapter_id,
        difficulty=difficulty,
        source_slide_numbers=source_slide_numbers,
        auto_generated=auto_generated
    )
    db.add(flashcard)
    db.commit()
    db.refresh(flashcard)
    return flashcard


def get_flashcard_by_id(db: Session, flashcard_id: int) -> Optional[Flashcard]:
    """Get flashcard by ID"""
    return db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()


def get_flashcards_by_deck(db: Session, deck_id: int, include_suspended: bool = False) -> List[Flashcard]:
    """Get all flashcards for a deck"""
    query = db.query(Flashcard).filter(Flashcard.deck_id == deck_id)
    if not include_suspended:
        query = query.filter(Flashcard.is_suspended == False)
    return query.all()


def get_flashcards_due_for_review(db: Session, user_id: str, limit: int = 50) -> List[Flashcard]:
    """Get flashcards due for review (spaced repetition)"""
    return (db.query(Flashcard)
            .join(FlashcardDeck)
            .filter(
        and_(
            FlashcardDeck.user_id == user_id,
            Flashcard.next_review_date <= datetime.now(),
            Flashcard.is_suspended == False
        )
    )
            .order_by(Flashcard.next_review_date)
            .limit(limit)
            .all())


def update_flashcard(db: Session, flashcard_id: int, **kwargs) -> Optional[Flashcard]:
    """Update flashcard with provided fields"""
    flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
    if flashcard:
        for key, value in kwargs.items():
            if hasattr(flashcard, key):
                setattr(flashcard, key, value)
        db.commit()
        db.refresh(flashcard)
    return flashcard


def delete_flashcard(db: Session, flashcard_id: int) -> bool:
    """Delete flashcard"""
    flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
    if flashcard:
        db.delete(flashcard)
        db.commit()
        return True
    return False


############### SPACED REPETITION ALGORITHM - SIMPLIFIED 3-BUTTON SYSTEM
def calculate_next_review(flashcard: Flashcard, response_quality: int) -> dict:
    """
    Calculate next review date using simplified 3-button spaced repetition algorithm

    Response qualities (simplified from 6-point to 3-point scale):
        1: Hard - Difficult to remember (short interval)
        3: Normal - Correct with some effort (normal interval)
        5: Easy - Easy to remember (long interval)
    """
    MIN_EASE_FACTOR = 1.3
    MAX_EASE_FACTOR = 3.0

    ease_factor = flashcard.ease_factor
    interval = flashcard.interval_days
    repetitions = flashcard.repetitions

    # Simplified algorithm for 3-button system
    if response_quality == 1:  # Hard - Reset learning
        repetitions = 0
        interval = 1  # Review tomorrow
        ease_factor = max(MIN_EASE_FACTOR, ease_factor - 0.2)

    elif response_quality == 3:  # Normal - Standard progression
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = int(interval * ease_factor)

        repetitions += 1
        ease_factor = ease_factor + 0.05

    elif response_quality == 5:  # Easy - Faster progression
        if repetitions == 0:
            interval = 4  # Skip to 4 days for easy cards
        elif repetitions == 1:
            interval = 10  # Longer second interval
        else:
            interval = int(interval * ease_factor * 1.3)  # Bonus multiplier

        repetitions += 1
        ease_factor = ease_factor + 0.15

    # Clamp ease factor to reasonable bounds
    ease_factor = max(MIN_EASE_FACTOR, min(MAX_EASE_FACTOR, ease_factor))
    interval = max(1, interval)

    # Calculate next review date
    next_review_date = datetime.now() + timedelta(days=interval)

    return {
        'ease_factor': ease_factor,
        'interval_days': interval,
        'repetitions': repetitions,
        'next_review_date': next_review_date
    }


def record_flashcard_review(db: Session, flashcard_id: int, user_id: str,
                            response_quality: int, response_time_seconds: float = None) -> FlashcardReview:
    """Record a flashcard review and update spaced repetition data"""
    flashcard = get_flashcard_by_id(db, flashcard_id)
    if not flashcard:
        raise ValueError(f"Flashcard {flashcard_id} not found")

    # Validate response quality for 3-button system
    if response_quality not in [1, 3, 5]:
        raise ValueError(f"Invalid response quality {response_quality}. Must be 1 (Hard), 3 (Normal), or 5 (Easy)")

    # Store previous state for analytics
    previous_ease_factor = flashcard.ease_factor
    previous_interval_days = flashcard.interval_days
    previous_repetitions = flashcard.repetitions

    # Calculate new spaced repetition values
    updates = calculate_next_review(flashcard, response_quality)

    # Update flashcard
    flashcard.ease_factor = updates['ease_factor']
    flashcard.interval_days = updates['interval_days']
    flashcard.repetitions = updates['repetitions']
    flashcard.next_review_date = updates['next_review_date']
    flashcard.last_reviewed_at = datetime.now()
    flashcard.times_reviewed += 1

    # Count as correct for Normal and Easy responses
    if response_quality >= 3:
        flashcard.times_correct += 1

    # Create review record
    review = FlashcardReview(
        flashcard_id=flashcard_id,
        user_id=user_id,
        response_quality=response_quality,
        response_time_seconds=response_time_seconds,
        previous_ease_factor=previous_ease_factor,
        previous_interval_days=previous_interval_days,
        previous_repetitions=previous_repetitions
    )

    db.add(review)
    db.commit()
    db.refresh(flashcard)
    db.refresh(review)

    return review


############### ANALYTICS
def get_deck_statistics(db: Session, deck_id: int) -> dict:
    """Get statistics for a flashcard deck"""
    total_cards = db.query(Flashcard).filter(Flashcard.deck_id == deck_id).count()

    due_cards = (db.query(Flashcard)
                 .filter(
        and_(
            Flashcard.deck_id == deck_id,
            Flashcard.next_review_date <= datetime.now(),
            Flashcard.is_suspended == False
        )
    )
                 .count())

    mastered_cards = (db.query(Flashcard)
                      .filter(
        and_(
            Flashcard.deck_id == deck_id,
            Flashcard.repetitions >= 5,  # Consider mastered after 5+ reviews
            Flashcard.ease_factor >= 2.0
        )
    )
                      .count())

    return {
        'total_cards': total_cards,
        'due_cards': due_cards,
        'mastered_cards': mastered_cards,
        'learning_cards': total_cards - mastered_cards,
        'mastery_percentage': (mastered_cards / total_cards * 100) if total_cards > 0 else 0
    }