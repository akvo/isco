from fastapi import Depends, Request, APIRouter, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_feedback as crud
from db.connection import get_session
from db import crud_organisation
from models.feedback import FeedbackDict, FeedbackPayload, FeedbackCategory
from middleware import verify_editor, find_secretariat_admins
from util.mailer import Email, MailTypeEnum

security = HTTPBearer()
feedback_route = APIRouter()


def send_feedback_to_secretariat_admin(session: Session, user,
                                       feedback: FeedbackPayload):
    organisation = crud_organisation.get_organisation_by_id(
        session=session, id=user.organisation)
    org_name = organisation.name
    secretariat_admins = find_secretariat_admins(
        session=session, organisation=user.organisation)
    if secretariat_admins:
        title = feedback["title"]
        category = feedback["category"]
        content = feedback["content"]
        body = f'''
        <div>
        Name: {user.name}<br/>\
        Email: {user.email}<br/>\
        Organisation: {org_name}<br/>\
        Title: {title}<br/>\
        Category: {category}<br/>\
        Feedback: {content}\
        </div>
        '''
        email = Email(recipients=[a.recipient for a in secretariat_admins],
                      body=body,
                      body_translation="",
                      type=MailTypeEnum.feedback)
        email.send


@feedback_route.post("/feedback",
                     response_model=FeedbackDict,
                     summary="add new feedback",
                     name="feedback:create",
                     tags=["Feedback"])
def add(req: Request,
        payload: FeedbackPayload,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    user = verify_editor(session=session,
                         authenticated=req.state.authenticated)
    if payload["category"] not in [f.value for f in FeedbackCategory]:
        raise HTTPException(status_code=422,
                            detail="Category is not in Feedback category enum")
    feedback = crud.add_feedback(session=session,
                                 user=user.id,
                                 payload=payload)
    send_feedback_to_secretariat_admin(session=session,
                                       user=user,
                                       feedback=payload)
    return feedback.serialize


@feedback_route.get("/feedback/",
                    response_model=List[FeedbackDict],
                    summary="get all feedback",
                    name="feedback:get_all",
                    tags=["Feedback"])
def get_data(req: Request,
             session: Session = Depends(get_session),
             credentials: credentials = Depends(security)):
    feedbacks = crud.get_feedback(session=session)
    return [f.serialize for f in feedbacks]
