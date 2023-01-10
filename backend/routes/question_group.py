from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import and_
import db.crud_question_group as crud
import db.crud_question as crud_question
from db.connection import get_session
from models.question_group import QuestionGroupBase, QuestionGroupDict
from models.question_group import QuestionGroupPayload, QuestionGroup
from models.question import QuestionType, Question

security = HTTPBearer()
question_group_route = APIRouter()


@question_group_route.post(
    "/question_group",
    response_model=QuestionGroupBase,
    summary="add new question group",
    name="question_group:create",
    tags=["Question Group"])
def add(req: Request, payload: QuestionGroupPayload,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    question_group = crud.add_question_group(session=session, payload=payload)
    return question_group.serialize


@question_group_route.post(
    "/default_question_group/{form_id:path}/{order:path}",
    response_model=QuestionGroupBase,
    summary="add default question group",
    name="question_group:create_default",
    tags=["Question Group"])
def create_default(
    req: Request, form_id: int, order: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    prev_group = session.query(QuestionGroup).filter(and_(
        QuestionGroup.form == form_id,
        QuestionGroup.order < order)).order_by(
            QuestionGroup.order.desc()).first()

    question_order = 0
    if prev_group:
        question_order = session.query(Question).filter(and_(
            Question.form == form_id,
            Question.question_group == prev_group.id)).order_by(
                Question.order.desc()).first().order

    default_question = {
        "form": form_id,
        "question_group": None,
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
        "order": question_order + 1,
        "option": None,
        "member_access": None,
        "isco_access": None,
        "skip_logic": None,
        "core_mandatory": False,
    }
    payload = {
        "form": form_id,
        "name": "New section - please change name",
        "description": None,
        "translations": None,
        "repeat": False,
        "repeat_text": None,
        "order": order,
        "member_access": None,
        "isco_access": None,
        "question": [default_question]
    }
    # reorder questions
    next_questions = session.query(Question).filter(
        and_(
            Question.form == form_id,
            Question.order > question_order
        )).all()
    if len(next_questions):
        next_questions_ids = [q.id for q in next_questions]
        crud_question.reorder_question(
            session=session, form=form_id, only=next_questions_ids,
            order=2 if question_order == 0 else question_order + 2)
    # reorder question groups
    next_groups = session.query(QuestionGroup).filter(
        and_(
            QuestionGroup.form == form_id,
            QuestionGroup.order >= order
        )).all()
    if len(next_groups):
        next_groups_ids = [qg.id for qg in next_groups]
        crud.reorder_question_group(
            session=session, form=form_id,
            only=next_groups_ids, order=2 if order == 1 else order + 1)
    question_group = crud.add_question_group(session=session, payload=payload)
    return question_group.serialize


@question_group_route.get(
    "/question_group/",
    response_model=List[QuestionGroupDict],
    summary="get all question groups",
    name="question_group:get_all",
    tags=["Question Group"])
def get(req: Request, session: Session = Depends(get_session)):
    question_group = crud.get_question_group(session=session)
    return [qg.serialize for qg in question_group]


@question_group_route.get(
    "/question_group/{id:path}",
    response_model=QuestionGroupBase,
    summary="get question group by id",
    name="question_group:get_by_id",
    tags=["Question Group"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    question_group = crud.get_question_group_by_id(session=session, id=id)
    return question_group.serialize


@question_group_route.put(
    "/question_group/{id:path}",
    response_model=QuestionGroupBase,
    summary="update question group",
    name="question_group:put",
    tags=["Question Group"])
def update(
    req: Request, id: int, payload: QuestionGroupPayload,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    question_group = crud.update_question_group(
        session=session, id=id, payload=payload)
    return question_group.serialize


@question_group_route.put(
    "/move-question-group/{id:path}/{selected_order:path}/{target_order:path}",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="move question group",
    name="question_group:move",
    tags=["Move"])
def move(
    req: Request, id: int, selected_order: int,
    target_order: int, target_id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    crud.move_question_group(
        session=session, id=id, selected_order=selected_order,
        target_order=target_order, target_id=target_id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@question_group_route.delete(
    "/question_group/{id:path}",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="delete question group by id",
    name="question_group:delete",
    tags=["Question Group"])
def delete(
    req: Request, id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    crud.delete_question_group(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
