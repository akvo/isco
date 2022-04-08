from http import HTTPStatus
from datetime import datetime
from math import ceil
from fastapi import Depends, Request, Response, APIRouter, HTTPException, Query
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy import and_
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import true
import db.crud_data as crud
from db import crud_question
from db import crud_answer
from db import crud_form
from models.answer import Answer, AnswerDict
from models.question_group import QuestionGroup
from models.question import QuestionType
from db.connection import get_session
from models.data import DataResponse, DataDict, DataOptionDict
from middleware import verify_editor, verify_super_admin

security = HTTPBearer()
data_route = APIRouter()


@data_route.get("/data/form/{form_id:path}",
                response_model=DataResponse,
                name="data:get",
                summary="get all datas",
                tags=["Data"])
def get(req: Request,
        form_id: int,
        page: int = 1,
        perpage: int = 10,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    data = crud.get_data(session=session,
                         form=form_id,
                         skip=(perpage * (page - 1)),
                         perpage=perpage)
    if not data["count"]:
        raise HTTPException(status_code=404, detail="Not found")
    total_page = ceil(data["count"] / 10) if data["count"] > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        'current': page,
        'data': [d.serialize for d in data["data"]],
        'total': data["count"],
        'total_page': total_page,
    }


@data_route.post("/data/form/{form_id}/{submitted:path}",
                 response_model=DataDict,
                 summary="add new data",
                 name="data:create",
                 tags=["Data"])
def add(req: Request,
        form_id: int,
        submitted: int,
        answers: List[AnswerDict],
        locked_by: Optional[int] = None,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    user = verify_editor(session=session,
                         authenticated=req.state.authenticated)
    # check if submission exist
    exist = crud.check_member_submission_exists(
        session=session, organisation=user.organisation)
    if exist:
        raise HTTPException(status_code=208,
                            detail="Submission already reported")
    geo = None
    answerlist = []
    names = []
    for a in answers:
        q = crud_question.get_question_by_id(session=session, id=a["question"])
        answer = Answer(question=q.id,
                        created=datetime.now(),
                        repeat_index=a["repeat_index"],
                        comment=a["comment"])
        if q.type in [QuestionType.input, QuestionType.text,
                      QuestionType.date]:
            answer.text = a["value"]
            if q.datapoint_name:
                names.append(a["value"])
        if q.type == QuestionType.number:
            answer.value = a["value"]
            if q.datapoint_name:
                names.append(str(a["value"]))
        if q.type == QuestionType.option:
            answer.options = [a["value"]]
        if q.type == QuestionType.multiple_option:
            answer.options = a["value"]
        if q.type == QuestionType.cascade:
            answer.options = a["value"]
        if q.type == QuestionType.nested_list:
            answer.options = a["value"]
        answerlist.append(answer)
    name = " - ".join(names)
    data = crud.add_data(session=session,
                         form=form_id,
                         name=name,
                         geo=geo,
                         locked_by=locked_by,
                         created_by=user.id,
                         organisation=user.organisation,
                         answers=answerlist,
                         submitted=submitted)
    return data.serialize


@data_route.get("/data/saved",
                response_model=List[DataOptionDict],
                summary="get saved data by login user organisation",
                name="data:get_saved_data_by_organisation",
                tags=["Data"])
def get_saved_data_by_organisation(req: Request,
                                   session: Session = Depends(get_session),
                                   credentials: credentials = Depends(security)
                                   ):
    user = verify_editor(session=session,
                         authenticated=req.state.authenticated)
    data = crud.get_data_by_organisation(session=session,
                                         organisation=user.organisation)
    if not data:
        return []
    return [d.to_options for d in data]


@data_route.get("/data/{id:path}",
                response_model=DataDict,
                summary="get data by id",
                name="data:get_by_id",
                tags=["Data"])
def get_by_id(req: Request,
              id: int,
              session: Session = Depends(get_session),
              credentials: credentials = Depends(security)):
    data = crud.get_data_by_id(session=session, id=id)
    if not data:
        raise HTTPException(status_code=404,
                            detail="data {} is not found".format(id))
    return data.serialize


@data_route.delete("/data/{id:path}",
                   responses={204: {
                       "model": None
                   }},
                   status_code=HTTPStatus.NO_CONTENT,
                   summary="delete data",
                   name="data:delete",
                   tags=["Data"])
def delete(req: Request,
           id: int,
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    crud.delete_by_id(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@data_route.delete("/data",
                   responses={204: {
                       "model": None
                   }},
                   status_code=HTTPStatus.NO_CONTENT,
                   summary="bulk delete data",
                   name="data:bulk-delete",
                   tags=["Data"])
def bulk_delete(req: Request,
                id: Optional[List[int]] = Query(None),
                session: Session = Depends(get_session),
                credentials: credentials = Depends(security)):
    verify_super_admin(req.state.authenticated, session)
    crud.delete_bulk(session=session, ids=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@data_route.put("/data/{id}/{submitted:path}",
                response_model=DataDict,
                summary="update data",
                name="data:update",
                tags=["Data"])
def update_by_id(req: Request,
                 id: int,
                 submitted: int,
                 answers: List[AnswerDict],
                 locked_by: Optional[int] = None,
                 session: Session = Depends(get_session),
                 credentials: credentials = Depends(security)):
    user = verify_editor(session=session,
                         authenticated=req.state.authenticated)
    # check data status before update
    # to prevent update submitted data
    data = crud.get_data_by_id(session=session, id=id, submitted=False)
    if not data:
        raise HTTPException(status_code=208,
                            detail="Submission already reported")
    submitted_by = None
    submitted_date = None
    if submitted:
        submitted_by = user.id
        submitted_date = datetime.now()
    form = crud_form.get_form_by_id(session=session, id=data.form)

    # get repeatable question ids
    repeat_qids = []
    repeat_group = session.query(
        QuestionGroup).filter(and_(
            QuestionGroup.form == form.id,
            QuestionGroup.repeat == true())).all()
    repeat_group = [g.get_question_ids for g in repeat_group]
    for group in repeat_group:
        for x in group:
            repeat_qids.append(x)
    # get current repeat group answer
    current_repeat = crud_answer.get_answer_by_data_and_question(
        session=session, data=data.id, questions=repeat_qids)

    questions = form.list_of_questions
    current_answers = crud_answer.get_answer_by_data_and_question(
        session=session, data=id, questions=[a["question"] for a in answers])
    checked = {}
    checked_payload = {}
    # dict key is pair of questionid_repeat_index
    [checked.update(a.to_dict) for a in current_answers]
    for a in answers:
        key = f"{a['question']}_{a['repeat_index']}"
        checked_payload.update({key: a})
        execute = "update"
        if a["question"] not in list(questions):
            raise HTTPException(
                status_code=401,
                detail="question {} is not part of this form".format(
                    a["question"]))
        a.update({"type": questions[a["question"]]})
        last_answer = []
        if a["type"] == QuestionType.option:
            a.update({"value": [a["value"]]})
        if key in list(checked):
            execute = "update"
            last_answer = checked[key]
        else:
            execute = "new"
        if execute == "update" and (
            a["value"] != last_answer["value"] or a[
                "comment"] != last_answer["comment"]):
            answer = last_answer["data"]
            a = crud_answer.update_answer(session=session,
                                          answer=answer,
                                          repeat_index=a["repeat_index"],
                                          comment=a["comment"],
                                          type=questions[a["question"]],
                                          value=a["value"])
        if execute == "new":
            answer = Answer(question=a["question"],
                            data=data.id,
                            created=datetime.now(),
                            repeat_index=a["repeat_index"],
                            comment=a["comment"])
            a = crud_answer.add_answer(session=session,
                                       answer=answer,
                                       type=questions[a["question"]],
                                       value=a["value"])
        if execute:
            data.locked_by = locked_by
            data.updated = datetime.now()
            data.submitted = submitted_date
            data.submitted_by = submitted_by
            data = crud.update_data(session=session, data=data)
    # check deleted repeat question group value
    # logic: checked value not in answers, that the deleted repeat group
    # delete answer by answer id
    current_repeat = [a.format_with_answer_id for a in current_repeat]
    for c in current_repeat:
        c_key = f"{c['question']}_{c['repeat_index']}"
        if c_key not in checked_payload:
            crud_answer.delete_answer_by_id(session=session, id=c['id'])
    return data.serialize
