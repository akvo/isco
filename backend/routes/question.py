from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy import and_
from sqlalchemy.orm import Session
from db.connection import get_session
import db.crud_question as crud
from models.question import QuestionBase, QuestionDict
from models.question import QuestionPayload, QuestionType
from models.question import RepeatingObjectType, Question

security = HTTPBearer()
question_route = APIRouter()


@question_route.post("/question",
                     response_model=QuestionBase,
                     summary="add new question",
                     name="question:create",
                     tags=["Question"])
def add(req: Request, payload: QuestionPayload,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    question = crud.add_question(session=session, payload=payload)
    return question.serialize


@question_route.post(
    "/default_question/{form_id:path}/{question_group_id:path}/{order:path}",
    response_model=QuestionBase,
    summary="add default question",
    name="question:create_default",
    tags=["Question"])
def create_default(req: Request, form_id: int,
                   question_group_id: int,
                   order: int,
                   session: Session = Depends(get_session),
                   credentials: credentials = Depends(security)):
    payload = {
        "form": form_id,
        "question_group": question_group_id,
        "name": "New question - please change name",
        "translations": None,
        "mandatory": False,
        "datapoint_name": False,
        "variable_name": None,
        "type": QuestionType.input.value,
        "personal_data": False,
        "rule": None,
        "tooltip": None,
        "tooltip_translations": None,
        "cascade": None,
        "repeating_objects": None,
        "order": order,
        "option": None,
        "member_access": None,
        "isco_access": None,
        "skip_logic": None,
    }
    next_questions = session.query(Question).filter(
        and_(Question.form == form_id, Question.order >= order)).all()
    if len(next_questions):
        next_questions_ids = [q.id for q in next_questions]
        crud.reorder_question(session=session, form=form_id,
                              only=next_questions_ids,
                              order=2 if order == 1 else order + 1)
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


@question_route.get("/question/type",
                    response_model=List[str],
                    summary="get all question type",
                    name="question:get_all_type",
                    tags=["Question"])
def get_question_type(req: Request, session: Session = Depends(get_session)):
    return [q.value for q in QuestionType]


@question_route.get("/question/repeating_object",
                    response_model=List[str],
                    summary="get all question repeating object options",
                    name="question:get_all_repeating_object",
                    tags=["Question"])
def get_repeating_object(req: Request,
                         session: Session = Depends(get_session)):
    return [ro.value for ro in RepeatingObjectType]


# @question_route.get("/question/{form_id:path}",
#                     response_model=List[QuestionDict],
#                     summary="get all questions by form id",
#                     name="question:get_all_by_form_id",
#                     tags=["Question"])
# def get_by_form_id(req: Request, form_id: int,
#                    session: Session = Depends(get_session)):
#     question = crud.get_question(session=session, form=form_id)
#     return [q.serialize for q in question]


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
                    response_model=QuestionBase,
                    summary="update question",
                    name="question:put",
                    tags=["Question"])
def update(req: Request, id: int, payload: QuestionPayload,
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    question = crud.update_question(session=session, id=id, payload=payload)
    return question.serialize


@question_route.put(
    "/move-question/{id:path}/{order:path}/{current_order:path}",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="move question",
    name="question:move",
    tags=["Move"])
def move(req: Request, id: int, order: int, current_order: int,
         session: Session = Depends(get_session),
         credentials: credentials = Depends(security)):
    crud.move_question(session=session, id=id,
                       order=order, current_order=current_order)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@question_route.delete("/question/{id:path}",
                       responses={204: {
                           "model": None}},
                       status_code=HTTPStatus.NO_CONTENT,
                       summary="delete question by id",
                       name="question:delete",
                       tags=["Question"])
def delete(req: Request, id: int, session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    crud.delete_question(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
