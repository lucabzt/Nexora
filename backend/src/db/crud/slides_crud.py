from typing import Optional, List

from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models.db_course import Slide

############### SLIDES
def get_slide_by_id(db: Session, slide_id: int) -> Optional[Slide]:
    """Get slide by ID"""
    return db.query(Slide).filter(Slide.id == slide_id).first()


def get_slides_by_chapter_id(db: Session, chapter_id: int) -> List[Slide]:
    """Get all slides for a specific chapter, ordered by index"""
    return db.query(Slide).filter(Slide.chapter_id == chapter_id).order_by(Slide.index).all()


def get_slide_by_chapter_and_index(db: Session, chapter_id: int, index: int) -> Optional[Slide]:
    """Get specific slide by chapter ID and slide index"""
    return db.query(Slide).filter(
        and_(Slide.chapter_id == chapter_id, Slide.index == index)
    ).first()


def create_slide(db: Session, chapter_id: int, index: int, code: str) -> Slide:
    """Create a new slide"""
    db_slide = Slide(
        chapter_id=chapter_id,
        index=index,
        code=code
    )
    db.add(db_slide)
    db.commit()
    db.refresh(db_slide)
    return db_slide


def create_multiple_slides(db: Session, chapter_id: int, slides_data: List[dict]) -> List[Slide]:
    """Create multiple slides for a chapter at once"""
    db_slides = []
    for s_data in slides_data:
        db_slide = Slide(
            chapter_id=chapter_id,
            index=s_data['index'],
            code=s_data['code']
        )
        db_slides.append(db_slide)
        db.add(db_slide)

    db.commit()
    for slide in db_slides:
        db.refresh(slide)
    return db_slides


def update_slide(db: Session, slide_id: int, **kwargs) -> Optional[Slide]:
    """Update slide with provided fields"""
    slide = db.query(Slide).filter(Slide.id == slide_id).first()
    if slide:
        for key, value in kwargs.items():
            if hasattr(slide, key):
                setattr(slide, key, value)
        db.commit()
        db.refresh(slide)
    return slide


def update_slide_code(db: Session, slide_id: int, code: str) -> Optional[Slide]:
    """Update slide code"""
    return update_slide(db, slide_id, code=code)


def update_slide_index(db: Session, slide_id: int, index: int) -> Optional[Slide]:
    """Update slide index"""
    return update_slide(db, slide_id, index=index)


def delete_slide(db: Session, slide_id: int) -> bool:
    """Delete slide by ID"""
    slide = db.query(Slide).filter(Slide.id == slide_id).first()
    if slide:
        db.delete(slide)
        db.commit()
        return True
    return False


def delete_slides_by_chapter(db: Session, chapter_id: int) -> int:
    """Delete all slides for a specific chapter. Returns number of deleted slides."""
    deleted_count = db.query(Slide).filter(Slide.chapter_id == chapter_id).delete()
    db.commit()
    return deleted_count


def get_slide_count_by_chapter(db: Session, chapter_id: int) -> int:
    """Get total number of slides in a chapter"""
    return db.query(Slide).filter(Slide.chapter_id == chapter_id).count()


def reorder_slides_by_chapter(db: Session, chapter_id: int, slide_id_order: List[int]) -> List[Slide]:
    """Reorder slides in a chapter by providing a list of slide IDs in the desired order"""
    slides = []
    for new_index, slide_id in enumerate(slide_id_order, 1):
        slide = db.query(Slide).filter(
            and_(Slide.id == slide_id, Slide.chapter_id == chapter_id)
        ).first()
        if slide:
            slide.index = new_index
            slides.append(slide)

    db.commit()
    for slide in slides:
        db.refresh(slide)
    return slides


def get_slides_by_index_range(db: Session, chapter_id: int, start_index: int, end_index: int) -> List[Slide]:
    """Get slides within a specific index range for a chapter"""
    return db.query(Slide).filter(
        and_(
            Slide.chapter_id == chapter_id,
            Slide.index >= start_index,
            Slide.index <= end_index
        )
    ).order_by(Slide.index).all()