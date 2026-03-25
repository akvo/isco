from fastapi import Depends, Request, APIRouter, HTTPException, BackgroundTasks
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_feedback as crud
from db.connection import get_session
from db import crud_organisation
from models.feedback import FeedbackDict, FeedbackPayload, FeedbackCategory
from middleware import verify_editor, find_secretariat_admins, verify_admin
from util.mailer import Email, MailTypeEnum
from util.sheets import generate_feedback_export
from fastapi.responses import StreamingResponse
from models.user import UserRole
import os
from datetime import datetime

security = HTTPBearer()
feedback_route = APIRouter()


def send_feedback_to_secretariat_admin(
    session: Session, user, feedback: FeedbackPayload,
    background_tasks: BackgroundTasks
):
    organisation = crud_organisation.get_organisation_by_id(
        session=session, id=user.organisation)
    org_name = organisation.name
    secretariat_admins = find_secretariat_admins(
        session=session, organisation=user.organisation)
    recipients = [a.recipient for a in secretariat_admins]
    if secretariat_admins:
        title = feedback["title"]
        category = feedback["category"]
        content = feedback["content"]
        body = f'''
        <div>
        A member has submitted some feedback<br/>\
        <br/>\
        Name: {user.name}<br/>\
        Email: {user.email}<br/>\
        Organisation: {org_name}<br/>\
        Title: {title}<br/>\
        Category: {category}<br/>\
        Feedback: {content}\
        </div>
        '''
        email = Email(recipients=recipients,
                      body=body,
                      body_translation="",
                      type=MailTypeEnum.feedback)
        background_tasks.add_task(email.send)


@feedback_route.post("/feedback",
                     response_model=FeedbackDict,
                     summary="add new feedback",
                     name="feedback:create",
                     tags=["Feedback"])
def add(req: Request,
        payload: FeedbackPayload,
        background_tasks: BackgroundTasks,
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
                                       feedback=payload,
                                       background_tasks=background_tasks)
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


@feedback_route.get("/feedback/download",
                    summary="download feedback",
                    name="feedback:download",
                    tags=["Feedback"])
def download(req: Request,
             isco_type_id: Optional[int] = None,
             monitoring_round: Optional[int] = None,
             session: Session = Depends(get_session),
             credentials: credentials = Depends(security)):
    user = verify_admin(session=session,
                        authenticated=req.state.authenticated)

    if user.role != UserRole.secretariat_admin:
        raise HTTPException(
            status_code=403,
            detail="Only secretariat_admin can download feedback")

    isco_type_ids = None
    if isco_type_id:
        isco_type_ids = [isco_type_id]

    results = crud.get_feedback_for_export(
        session=session,
        isco_type_ids=isco_type_ids,
        monitoring_round=monitoring_round)

    if not results:
        raise HTTPException(
            status_code=404, detail="No feedback data available")

    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"feedback_export_{date_str}"
    file_path = generate_feedback_export(filename, results)

    def iterfile():
        with open(file_path, mode="rb") as file_like:
            yield from file_like
        if os.path.exists(file_path):
            os.remove(file_path)

    return StreamingResponse(
        iterfile(),
        media_type="application/vnd.openxmlformats-officedocument"
                   ".spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}.xlsx"
        })
