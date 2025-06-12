from sqlalchemy.orm import Session
from ..db.models.db_course import Course, CourseStatus  # Your SQLAlchemy model
from datetime import datetime, timedelta
from datetime import timezone
import logging


from ..db.database import get_db

def update_stuck_courses():
    db_gen = get_db()
    db: Session = next(db_gen)

    logging.info("Checking for stuck courses...")

    try:
        threshold = datetime.now(timezone.utc) - timedelta(hours=2) # 2 hours threshold

        stuck_courses = db.query(Course).filter(
            Course.status == "creating",
            Course.created_at < threshold
        ).all()

        for course in stuck_courses:
            logging.info("Marking course %s as error due to timeout.", course.id)

            course.status = CourseStatus.FAILED
            course.error_msg = "Course creation timed out."

        db.commit()
        print(f"Marked {len(stuck_courses)} stuck courses as error.")

    except Exception as e:
        print(f"Scheduler error: {e}")
    finally:
        next(db_gen, None)