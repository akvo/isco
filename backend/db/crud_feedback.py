from datetime import datetime
from typing import List, Optional
from sqlalchemy import extract
from sqlalchemy.orm import Session
from models.feedback import Feedback
from models.feedback import FeedbackDict, FeedbackPayload
from models.user import User
from models.organisation import Organisation
from models.organisation_isco import OrganisationIsco


def add_feedback(
    session: Session, user: int, payload: FeedbackPayload
) -> FeedbackDict:
    feedback = Feedback(
        id=None,
        user=user,
        title=payload["title"],
        category=payload["category"],
        content=payload["content"],
        created=datetime.now(),
    )
    session.add(feedback)
    session.commit()
    session.flush()
    session.refresh(feedback)
    return feedback


def get_feedback(session: Session) -> List[FeedbackDict]:
    return session.query(Feedback).all()


def get_feedback_for_export(
    session: Session,
    isco_type_ids: Optional[List[int]] = None,
    monitoring_round: Optional[int] = None,
):
    query = (
        session.query(
            Feedback.created,
            Feedback.title,
            Feedback.category,
            Feedback.content,
            User.name.label("user_name"),
            Organisation.name.label("organisation_name"),
        )
        .join(User, Feedback.user == User.id)
        .join(Organisation, User.organisation == Organisation.id)
    )

    if isco_type_ids is not None:
        query = query.filter(
            Organisation.isco_type.any(
                OrganisationIsco.isco_type.in_(isco_type_ids)
            )
        )

    if monitoring_round:
        query = query.filter(
            extract("year", Feedback.created) == monitoring_round
        )

    # Execute query
    results = query.order_by(Feedback.created.desc()).all()
    data = []
    for r in results:
        data.append({
            "monitoring_round": r.created.year if r.created else None,
            "user_name": r.user_name,
            "organisation_name": r.organisation_name,
            "title": r.title,
            "category": r.category,
            "content": r.content
        })
    return data


def delete_feedback_by_ids(session: Session, ids: List[int]):
    session.query(Feedback).filter(Feedback.id.in_(ids)).delete(
        synchronize_session="fetch"
    )
    session.commit()
