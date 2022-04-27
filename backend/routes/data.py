import os
import json
import requests as r
from http import HTTPStatus
from datetime import datetime
from math import ceil
from fastapi import Depends, Request, Response, APIRouter, HTTPException, Query
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
import db.crud_data as crud
from db import crud_answer
from db import crud_form
from db import crud_collaborator
from models.answer import Answer, AnswerDict
from models.question import QuestionType
from db.connection import get_session
from models.data import DataResponse
from models.data import DataDict, DataOptionDict
from models.data import Data, SubmissionProgressDict
from models.organisation_isco import OrganisationIsco
from models.organisation import Organisation
from middleware import verify_editor, verify_super_admin
from util.survey_config import MEMBER_SURVEY, PROJECT_SURVEY

security = HTTPBearer()
data_route = APIRouter()


def get_questions_from_published_form(session: Session, form_id: int):
    form = crud_form.get_form_by_id(session=session, id=form_id)
    TESTING = os.environ.get("TESTING")
    if TESTING:
        webform = json.load(open(form.url))
    else:
        webform = r.get(form.url)
        webform = webform.json()
    question_groups = []
    questions = {}
    for qg in webform['question_group']:
        qids = []
        for q in qg['question']:
            questions.update({q['id']: q})
            qids.append(q['id'])
        qg['question'] = qids
        question_groups.append(qg)
    return {"question_groups": question_groups, "questions": questions}


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
    exist = crud.check_member_submission_exists(session=session,
                                                form=form_id,
                                                organisation=user.organisation)
    if exist:
        raise HTTPException(status_code=208,
                            detail="Submission already reported")
    # get questions from published form
    published = get_questions_from_published_form(session=session,
                                                  form_id=form_id)
    questions = published['questions']
    # end get questions published form
    geo = None
    answerlist = []
    names = []
    for a in answers:
        q = questions[a['question']]
        answer = Answer(question=q['id'],
                        created=datetime.now(),
                        repeat_index=a["repeat_index"],
                        comment=a["comment"])
        if q['type'] in [
                QuestionType.input.value, QuestionType.text.value,
                QuestionType.date.value
        ]:
            answer.text = a["value"]
            if q['datapoint_name']:
                names.append(a["value"])
        if q['type'] == QuestionType.number.value:
            answer.value = a["value"]
            if q['datapoint_name']:
                names.append(str(a["value"]))
        if q['type'] == QuestionType.option.value:
            answer.options = [a["value"]]
        if q['type'] == QuestionType.multiple_option.value:
            answer.options = a["value"]
        if q['type'] == QuestionType.cascade.value:
            answer.options = a["value"]
        if q['type'] == QuestionType.nested_list.value or q['type'] == "tree":
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
def get_saved_data_by_organisation(
        req: Request,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    user = verify_editor(session=session,
                         authenticated=req.state.authenticated)
    # get saved data from logged user organisation
    data = crud.get_data_by_organisation(session=session,
                                         organisation=user.organisation)
    # check for collaborator
    collabs = crud_collaborator.get_collaborator_by_organisation(
        session=session, organisation=user.organisation)
    if collabs:
        collab_data = crud.get_data_by_ids(
            session=session, ids=[c.only_data_id for c in collabs])
        data = [*data, *collab_data]
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
    verify_super_admin(session=session, authenticated=req.state.authenticated)
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
    # if locked, allow update only by locked_by === user id
    if data.locked_by and data.locked_by != user.id:
        raise HTTPException(status_code=401, detail="Submission is locked")
    submitted_by = None
    submitted_date = None
    if submitted:
        submitted_by = user.id
        submitted_date = datetime.now()

    # get questions from published form
    published = get_questions_from_published_form(session=session,
                                                  form_id=data.form)
    question_groups = published['question_groups']
    questions = published['questions']
    # end get questions published form

    # get repeatable question ids
    repeat_qids = []
    for qg in question_groups:
        if qg['repeatable'] is True:
            for qid in qg['question']:
                repeat_qids.append(qid)

    # get current repeat group answer
    current_repeat = crud_answer.get_answer_by_data_and_question(
        session=session, data=data.id, questions=repeat_qids)

    # questions = form.list_of_questions
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
        qtype = questions[a["question"]]['type']
        a.update({"type": qtype})
        last_answer = []
        if key in list(checked):
            execute = "update"
            last_answer = checked[key]
        else:
            execute = "new"
        if execute == "update" and (a["value"] != last_answer["value"]
                                    or a["comment"] != last_answer["comment"]):
            answer = last_answer["data"]
            a = crud_answer.update_answer(session=session,
                                          answer=answer,
                                          repeat_index=a["repeat_index"],
                                          comment=a["comment"],
                                          type=qtype,
                                          value=a["value"])
        if execute == "new":
            answer = Answer(question=a["question"],
                            data=data.id,
                            created=datetime.now(),
                            repeat_index=a["repeat_index"],
                            comment=a["comment"])
            a = crud_answer.add_answer(session=session,
                                       answer=answer,
                                       type=qtype,
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


@data_route.get("/submission/progress",
                response_model=List[SubmissionProgressDict],
                name="submission:progress",
                summary="view submission progress",
                tags=["Data"])
def get_submission_progress(
    req: Request,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    user = verify_super_admin(
        session=session, authenticated=req.state.authenticated)
    find_org_iscos = session.query(OrganisationIsco).filter(
        OrganisationIsco.organisation == user.organisation).all()
    isco_ids = [i.isco_type for i in find_org_iscos]
    org_by_isco = session.query(OrganisationIsco)
    # if isco = 1 (All) show from all organisation
    # if 1 in isco_ids:
    #     org_by_isco = org_by_isco.all()
    # if 1 not in isco_ids:
    org_by_isco = org_by_isco.filter(
        OrganisationIsco.isco_type.in_(isco_ids)).all()
    org_ids = [o.organisation for o in org_by_isco]
    data = session.query(
        Data.organisation,
        Data.form,
        Data.submitted,
        func.count(Data.id).label('count')).filter(
            Data.organisation.in_(org_ids)).group_by(
                Data.organisation, Data.form, Data.submitted)
    if not data:
        raise HTTPException(status_code=404,
                            detail="submission progress not found")
    organisations = session.query(Organisation).filter(
        Organisation.id.in_(org_ids)).all()
    orgs_dict = {}
    for o in organisations:
        orgs_dict.update({o.id: o.name})
    data = data.all()
    res = []
    for d in data:
        form_type = ""
        if d.form in MEMBER_SURVEY:
            form_type = "member"
        if d.form in PROJECT_SURVEY:
            form_type = "project"
        res.append({
            "organisation": orgs_dict[d.organisation],
            "form": d.form,
            "form_type": form_type,
            "submitted": True if d.submitted else False,
            "count": d.count
        })
    return res
