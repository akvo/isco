from fastapi import Depends, Request, APIRouter, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_feedback as crud
from db.connection import get_session
from models.feedback import FeedbackDict, FeedbackPayload, FeedbackCategory
from middleware import verify_editor

security = HTTPBearer()
feedback_route = APIRouter()


@feedback_route.post("/feedback",
                     response_model=FeedbackDict,
                     summary="add new feedback",
                     name="feedback:create",
                     tags=["Feedback"])
def add(req: Request, payload: FeedbackPayload,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    user = verify_editor(session=session,
                         authenticated=req.state.authenticated)
    if payload["category"] not in [f.value for f in FeedbackCategory]:
        raise HTTPException(
            status_code=422,
            detail="Category is not in Feedback category enum")
    feedback = crud.add_feedback(session=session,
                                 user=user.id,
                                 payload=payload)
    return feedback.serialize


@feedback_route.get("/feedback",
                    response_model=List[FeedbackDict],
                    summary="get all feedback",
                    name="feedback:get_all",
                    tags=["Feedback"])
def get_by_data_id(req: Request, session: Session = Depends(get_session),
                   credentials: credentials = Depends(security)):
    feedbacks = crud.get_feedback(session=session)
    return [f.serialize for f in feedbacks]
