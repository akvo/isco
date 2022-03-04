from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from typing import List
from sqlalchemy.orm import Session
from db.connection import get_session
import db.crud_question as crud
from models.question import QuestionBase, QuestionDict, QuestionPayload

question_route = APIRouter()


@question_route.post("/question",
                     response_model=QuestionDict,
                     summary="add new question",
                     name="question:create",
                     tags=["Question"])
def add(req: Request, payload: QuestionPayload,
        session: Session = Depends(get_session)):
    question = crud.add_question(session=session, payload=payload)
    return question.serialize


@question_route.get("/question/",
                    response_model=List[QuestionDict],
                    summary="get all questions",
                    name="question:get_all",
                    tags=["Question"])
def get(req: Request, session: Session = Depends(get_session)):
    question = crud.get_question(session=session)
    return [q.serialize for q in question]


@question_route.get("/question/{form_id:path}",
                    response_model=List[QuestionDict],
                    summary="get all questions by form id",
                    name="question:get_all_by_form_id",
                    tags=["Question"])
def get_by_form_id(req: Request, form_id: int,
                   session: Session = Depends(get_session)):
    question = crud.get_question(session=session, form=form_id)
    return [q.serialize for q in question]


@question_route.get("/question/{id:path}",
                    response_model=QuestionBase,
                    summary="get question by id",
                    name="question:get_by_id",
                    tags=["Question"])
def get_by_id(req: Request, id: int,
              session: Session = Depends(get_session)):
    question = crud.get_question_by_id(session=session, id=id)
    return question.serialize


@question_route.put("/question/{id:path}",
                    response_model=QuestionDict,
                    summary="update question",
                    name="question:put",
                    tags=["Question"])
def update(req: Request, id: int, payload: QuestionPayload,
           session: Session = Depends(get_session)):
    question = crud.update_question(session=session, id=id, payload=payload)
    return question.serialize


@question_route.delete("/question/{id:path}",
                       responses={204: {
                           "model": None}},
                       status_code=HTTPStatus.NO_CONTENT,
                       summary="delete question by id",
                       name="question:delete",
                       tags=["Question"])
def delete(req: Request, id: int, session: Session = Depends(get_session)):
    crud.delete_question(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
