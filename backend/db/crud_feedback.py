from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from models.feedback import Feedback
from models.feedback import FeedbackDict, FeedbackPayload


def add_feedback(session: Session, user: int,
                 payload: FeedbackPayload) -> FeedbackDict:
    feedback = Feedback(id=None,
                        user=user,
                        title=payload["title"],
                        category=payload["category"],
                        content=payload["content"],
                        created=datetime.now())
    session.add(feedback)
    session.commit()
    session.flush()
    session.refresh(feedback)
    return feedback


def get_feedback(session: Session) -> List[FeedbackDict]:
    return session.query(Feedback).all()


def delete_feedback_by_ids(session: Session, ids: List[int]):
    session.query(Feedback).filter(
        Feedback.id.in_(ids)).delete(synchronize_session='fetch')
    session.commit()
