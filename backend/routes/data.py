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
from sqlalchemy import func, and_
from sqlalchemy.orm import Session
import db.crud_data as crud
from db import crud_answer, crud_form, crud_collaborator, crud_organisation
from models.answer import Answer, AnswerDict
from models.question import QuestionType, Question
from models.cascade_list import CascadeList
from db.connection import get_session
from models.data import DataResponseQuestionName
from models.data import DataDict, DataOptionDict
from models.data import Data, SubmissionProgressDict
from models.organisation import Organisation
from middleware import verify_editor, verify_super_admin, verify_user
from middleware import organisations_in_same_isco, find_secretariat_admins
from util.survey_config import MEMBER_SURVEY, PROJECT_SURVEY, LIMITED_SURVEY
from util.mailer import Email, MailTypeEnum

security = HTTPBearer()
data_route = APIRouter()

BUCKET_FOLDER = os.environ.get("BUCKET_FOLDER")
CONFIG_SOURCE_PATH = "./source/config"


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
    core_mandatory_questions = []
    for qg in webform['question_group']:
        qids = []
        for q in qg['question']:
            qid = q['id']
            questions.update({qid: q})
            qids.append(qid)
            if q.get('core_mandatory') or q.get('coreMandatory'):
                core_mandatory_questions.append(qid)
        qg['question'] = qids
        question_groups.append(qg)
    return {
        "form_name": webform['name'],
        "question_groups": question_groups,
        "questions": questions,
        "core_mandatory_questions": core_mandatory_questions,
    }


def check_core_mandatory_questions_answer(
    published: dict, answers: List[AnswerDict], submitted: int
):
    core_mandatory_questions = published['core_mandatory_questions']
    answer_qids = [a.get('question') for a in answers]
    # is core mandatory question answered
    if submitted and core_mandatory_questions and \
       not set(core_mandatory_questions).issubset(answer_qids):
        # not all core mandatory answered
        raise HTTPException(
            status_code=405,
            detail="Please answer all core mandatory questions")


def check_computed_validation(form_id: int, answers: List[AnswerDict]):
    TESTING = os.environ.get("TESTING")
    if TESTING:
        BUCKET_FOLDER = "notset"
    # read computed validation config
    json_file_path = f"{CONFIG_SOURCE_PATH}/{BUCKET_FOLDER}"
    json_file_path = f"{json_file_path}//computed_validations.json"
    with open(json_file_path, 'r') as j:
        computed_validations = json.loads(j.read())
    computed_validation = [
        x for x in computed_validations
        if int(x.get('form_id')) == form_id]
    if computed_validation:
        errors = []
        computed_validation = computed_validation[0]
        for cv in computed_validation.get('validations'):
            cv_qids = cv.get('question_ids')
            cv_max = cv.get("max")
            cv_min = cv.get("min")
            cv_answers = []
            for a in answers:
                if not a.get('question') in cv_qids:
                    continue
                value = a.get('value')
                if a.get('type') == QuestionType.number.value:
                    value = int(value)
                cv_answers.append(value)
            total_cv_answers = sum(cv_answers)
            if cv_max and total_cv_answers > cv_max:
                errors.append(cv)
            if cv_min and total_cv_answers < cv_min:
                errors.append(cv)
        if errors:
            raise HTTPException(status_code=405, detail=errors)


def notify_secretariat_admin(session: Session, user, form_name: str):
    organisation = crud_organisation.get_organisation_by_id(
        session=session, id=user.organisation)
    org_name = organisation.name
    # send to secretariat admin
    secretariat_admins = find_secretariat_admins(
        session=session, organisation=user.organisation)
    if secretariat_admins:
        body_secretariat = f'''{user.name} ({user.email}) from {org_name}
                            successfully submitted data for {form_name}.
                            '''
        email_secretariat = Email(
            recipients=[a.recipient for a in secretariat_admins],
            type=MailTypeEnum.notify_submission_completed_to_secretariat_admin,
            body=body_secretariat)
        email_secretariat.send


@data_route.get("/data/form/{form_id:path}",
                response_model=DataResponseQuestionName,
                name="data:get",
                summary="get all datas",
                tags=["Data"])
def get(req: Request,
        form_id: int,
        page: int = 1,
        perpage: int = 10,
        submitted: Optional[bool] = False,
        filter_same_isco: Optional[bool] = False,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    user = verify_user(
        session=session, authenticated=req.state.authenticated)
    org_ids = []
    if filter_same_isco:
        org_ids = organisations_in_same_isco(
            session=session, organisation=user.organisation)
    data = crud.get_data(
        session=session,
        form=form_id,
        skip=(perpage * (page - 1)),
        perpage=perpage,
        submitted=submitted,
        org_ids=org_ids)
    if not data["count"]:
        raise HTTPException(status_code=404, detail="Not found")
    total_page = ceil(data["count"] / perpage) if data["count"] > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    # transform cascade answer value
    questions = session.query(Question).filter(and_(
        Question.form == form_id,
        Question.type == QuestionType.cascade.value
    )).all()
    cascades = {}
    for q in questions:
        temp = {}
        cascade_list = session.query(CascadeList).filter(
            CascadeList.cascade == q.cascade).all()
        for cl in cascade_list:
            temp.update(({cl.id: cl.name}))
        cascades.update({q.id: temp})
    result = [d.serializeWithQuestionName for d in data["data"]]
    for res in result:
        for a in res['answer']:
            qid = a['question']
            value = a['value']
            if qid in cascades and cascades[qid] and value:
                temp = cascades[qid]
                new_value = [temp[int(float(x))] for x in value]
                a['value'] = "|".join(new_value)
    return {
        'current': page,
        'data': result,
        'total': data["count"],
        'total_page': total_page,
    }


@data_route.post(
    "/data/form/{form_id}/{submitted:path}",
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
    user = verify_editor(
        session=session,
        authenticated=req.state.authenticated)
    # check if submission exist
    exist = crud.check_member_submission_exists(
        session=session, form=form_id, organisation=user.organisation)
    if exist:
        raise HTTPException(
            status_code=208, detail="Submission already reported")
    # get questions from published form
    published = get_questions_from_published_form(
        session=session, form_id=form_id)
    questions = published['questions']
    # end get questions published form

    # check core mandatory question answered
    check_core_mandatory_questions_answer(
        published=published, answers=answers, submitted=submitted)
    # end check core mandatory question answered

    # validate by computed validations
    check_computed_validation(form_id=form_id, answers=answers)
    # end validate by computed validations

    # generating answers
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
    data = crud.add_data(
        session=session,
        form=form_id,
        name=name,
        geo=geo,
        locked_by=locked_by,
        created_by=user.id,
        organisation=user.organisation,
        answers=answerlist,
        submitted=submitted)
    # if submitted send notification email to secretariat admin
    if submitted:
        notify_secretariat_admin(
            session=session, user=user, form_name=published['form_name'])
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
    user = verify_editor(
        session=session,
        authenticated=req.state.authenticated)
    # get saved data from logged user organisation
    data = crud.get_data_by_organisation(
        session=session, organisation=user.organisation)
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


@data_route.get(
    "/data/{id:path}",
    response_model=DataDict,
    summary="get data by id",
    name="data:get_by_id",
    tags=["Data"])
def get_by_id(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    data = crud.get_data_by_id(session=session, id=id)
    if not data:
        raise HTTPException(
            status_code=404,
            detail="data {} is not found".format(id))
    return data.serialize


@data_route.delete(
    "/data/{id:path}",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="delete data",
    name="data:delete",
    tags=["Data"])
def delete(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    crud.delete_by_id(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@data_route.delete(
    "/data",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="bulk delete data",
    name="data:bulk-delete",
    tags=["Data"])
def bulk_delete(
    req: Request,
    id: Optional[List[int]] = Query(None),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    crud.delete_bulk(session=session, ids=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@data_route.put(
    "/data/{id}/{submitted:path}",
    response_model=DataDict,
    summary="update data",
    name="data:update",
    tags=["Data"])
def update_by_id(
    req: Request,
    id: int,
    submitted: int,
    answers: List[AnswerDict],
    locked_by: Optional[int] = None,
    data_cleaning: Optional[bool] = False,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    # data cleaning verify super admin/secretariat admin
    if data_cleaning:
        user = verify_super_admin(
            session=session,
            authenticated=req.state.authenticated)
    if not data_cleaning:
        user = verify_editor(
            session=session,
            authenticated=req.state.authenticated)
    # check data status before update
    # to prevent update submitted data
    data = crud.get_data_by_id(
        session=session, id=id,
        submitted=True if data_cleaning else False)
    if not data:
        raise HTTPException(
            status_code=208,
            detail="Submission already reported")
    # if locked, allow update only by locked_by === user id
    # but open for data cleaning
    if data.locked_by and data.locked_by != user.id and not data_cleaning:
        raise HTTPException(status_code=401, detail="Submission is locked")
    # update submitted_by & submitted if not data cleaning
    submitted_by = data.submitted_by
    submitted_date = data.submitted
    if submitted and not data_cleaning:
        submitted_by = user.id
        submitted_date = datetime.now()

    # get questions from published form
    published = get_questions_from_published_form(
        session=session, form_id=data.form)
    question_groups = published['question_groups']
    questions = published['questions']
    # end get questions published form

    # check core mandatory question answered
    check_core_mandatory_questions_answer(
        published=published, answers=answers, submitted=submitted)
    # end check core mandatory question answered

    # validate by computed validations
    check_computed_validation(form_id=data.form, answers=answers)
    # end validate by computed validations

    # get repeatable question ids
    repeat_qids = []
    for qg in question_groups:
        if qg['repeatable'] is True:
            for qid in qg['question']:
                repeat_qids.append(qid)

    # questions = form.list_of_questions
    checked = {}
    checked_payload = {}

    # if data_cleaning, delete old answer and save payload
    answer_ids = []
    if data_cleaning:
        current_repeat = []
        answers_to_delete = session.query(Answer).filter(
            Answer.data == data.id).all()
        answer_ids = [a.id for a in answers_to_delete]

    if not data_cleaning:
        # get current repeat group answer
        current_repeat = crud_answer.get_answer_by_data_and_question(
            session=session, data=data.id, questions=repeat_qids)

        current_answers = crud_answer.get_answer_by_data_and_question(
            session=session, data=id,
            questions=[a["question"] for a in answers])

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
            a = crud_answer.update_answer(
                session=session,
                answer=answer,
                repeat_index=a["repeat_index"],
                comment=a["comment"],
                type=qtype,
                value=a["value"])
        if execute == "new":
            answer = Answer(
                question=a["question"],
                data=data.id,
                created=datetime.now(),
                repeat_index=a["repeat_index"],
                comment=a["comment"])
            a = crud_answer.add_answer(
                session=session,
                answer=answer,
                type=qtype,
                value=a["value"])
        if execute:
            # don't update locked_by for data_cleaning
            data.locked_by = locked_by \
                if not data_cleaning else data.locked_by
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
    # delete old answer after insert
    if data_cleaning and answer_ids:
        session.query(Answer).filter(
            Answer.id.in_(answer_ids)).delete(synchronize_session='fetch')
        session.commit()
    # if submitted send and not
    # data_cleaning notification email to secretariat admin
    if submitted and not data_cleaning:
        notify_secretariat_admin(
            session=session, user=user, form_name=published['form_name'])
    return data.serialize


@data_route.get(
    "/submission/progress",
    response_model=List[SubmissionProgressDict],
    name="submission:progress",
    summary="view submission progress",
    tags=["Data"])
def get_submission_progress(
    req: Request,
    organisation: Optional[List[int]] = Query(None),
    member_not_submitted: Optional[bool] = False,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    admin = verify_super_admin(
        session=session, authenticated=req.state.authenticated)
    org_ids = organisations_in_same_isco(
        session=session, organisation=admin.organisation)
    # validate if organisation param not in same isco
    if organisation and not list(set(org_ids) & set(organisation)):
        raise HTTPException(status_code=403,
                            detail="Forbidden access")
    if organisation:
        org_ids = organisation
    data = session.query(
        Data.organisation, Data.form, Data.submitted,
        func.count(Data.id).label('count')
    ).filter(Data.organisation.in_(org_ids)).group_by(
        Data.organisation, Data.form, Data.submitted).all()
    if not data:
        return []
    organisations = session.query(Organisation).filter(
        Organisation.id.in_(org_ids)).all()
    orgs_dict = {}
    for o in organisations:
        orgs_dict.update({o.id: o.name})
    res = []
    for d in data:
        form_type = ""
        if d.form in MEMBER_SURVEY:
            form_type = "member"
        if d.form in PROJECT_SURVEY:
            form_type = "project"
        if d.form in LIMITED_SURVEY:
            form_type = "limited"
        res.append({
            "organisation": orgs_dict[d.organisation],
            "form": d.form,
            "form_type": form_type,
            "submitted": True if d.submitted else False,
            "count": d.count
        })
    # filters organisations that has not "submitted" any member questionnaire
    if member_not_submitted:
        # defined member = [org] and project = [org]
        # to show organisation if there's no submission for member yet
        temp = {}
        for x in res:
            if x['form_type'] in temp:
                temp[x['form_type']].append(x['organisation'])
            else:
                temp.update({x['form_type']: [x['organisation']]})
        member_submitted = {}
        for x in res:
            if x['form'] in MEMBER_SURVEY and x['submitted']:
                member_submitted.update({x['organisation']: True})
        filter_orgs = {}  # not submitted temp
        for x in res:
            if x['form'] in MEMBER_SURVEY and not x['submitted'] \
               and x['organisation'] not in member_submitted:
                filter_orgs.update({x['organisation']: True})
        filtered = []
        for x in res:
            org = x['organisation']
            if org in filter_orgs and filter_orgs[org]:
                filtered.append(x)
            if "member" in temp and org not in temp["member"]:
                filtered.append(x)
        return filtered
    return res
