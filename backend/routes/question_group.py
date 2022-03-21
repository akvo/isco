from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_question_group as crud
from db.connection import get_session
from models.question_group import QuestionGroupBase, QuestionGroupDict
from models.question_group import QuestionGroupPayload

security = HTTPBearer()
question_group_route = APIRouter()


@question_group_route.post("/question_group",
                           response_model=QuestionGroupBase,
                           summary="add new question group",
                           name="question_group:create",
                           tags=["Question Group"])
def add(req: Request, payload: QuestionGroupPayload,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    question_group = crud.add_question_group(session=session, payload=payload)
    return question_group.serialize


@question_group_route.post("/default_question_group/{form_id:path}",
                           response_model=QuestionGroupBase,
                           summary="add default question group",
                           name="question_group:create_default",
                           tags=["Question Group"])
def create_default(req: Request, form_id: int,
                   session: Session = Depends(get_session),
                   credentials: credentials = Depends(security)):
    payload = {
        "form": form_id,
        "name": "New section title",
        "description": None,
        "translations": None,
        "repeat": False,
        "order": None,
        "member_access": None,
        "isco_access": None,
        "question": None
    }
    question_group = crud.add_question_group(session=session, payload=payload)
    return question_group.serialize


@question_group_route.get("/question_group/",
                          response_model=List[QuestionGroupDict],
                          summary="get all question groups",
                          name="question_group:get_all",
                          tags=["Question Group"])
def get(req: Request, session: Session = Depends(get_session)):
    question_group = crud.get_question_group(session=session)
    return [qg.serialize for qg in question_group]


@question_group_route.get("/question_group/{id:path}",
                          response_model=QuestionGroupBase,
                          summary="get question group by id",
                          name="question_group:get_by_id",
                          tags=["Question Group"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    question_group = crud.get_question_group_by_id(session=session, id=id)
    return question_group.serialize


@question_group_route.put("/question_group/{id:path}",
                          response_model=QuestionGroupBase,
                          summary="update question group",
                          name="question_group:put",
                          tags=["Question Group"])
def update(req: Request, id: int, payload: QuestionGroupPayload,
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    question_group = crud.update_question_group(session=session,
                                                id=id,
                                                payload=payload)
    return question_group.serialize


@question_group_route.delete("/question_group/{id:path}",
                             responses={204: {
                                    "model": None
                                 }},
                             status_code=HTTPStatus.NO_CONTENT,
                             summary="delete question group by id",
                             name="question_group:delete",
                             tags=["Question Group"])
def delete(req: Request, id: int, session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    crud.delete_question_group(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
