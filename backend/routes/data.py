import os
import json
import requests as r
from http import HTTPStatus
from datetime import datetime
from math import ceil
from fastapi import Depends, Request, Response, APIRouter, HTTPException, Query
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional, Union
from sqlalchemy import func, and_, extract, null
from sqlalchemy.orm import Session
import db.crud_data as crud
from db import crud_answer, crud_form, crud_collaborator, crud_organisation
from models.answer import Answer, AnswerDict, convert_single_option_value
from models.question import QuestionType, Question
from models.cascade_list import CascadeList
from db.connection import get_session
from models.data import DataResponseQuestionName
from models.data import DataDict, DataOptionDict
from models.data import Data, SubmissionProgressDict
from models.organisation import Organisation
from middleware import verify_editor, verify_super_admin, verify_user
from middleware import organisations_in_same_isco, find_secretariat_admins
from middleware import find_member_admins
from util.survey_config import MEMBER_SURVEY, PROJECT_SURVEY, LIMITED_SURVEY
from util.mailer import Email, MailTypeEnum
from routes.collaborator import send_collaborator_email
from util.common import generate_datapoint_name, get_prev_year
from models.user import User
from models.organisation_member import OrganisationMember
from models.organisation_isco import OrganisationIsco
from models.member_type import MemberType
from models.isco_type import IscoType

security = HTTPBearer()
data_route = APIRouter()

BUCKET_FOLDER = os.environ.get("BUCKET_FOLDER")
CONFIG_SOURCE_PATH = "./source/config"


def get_questions_from_published_form(
    session: Session, form_id: int, user: User
):
    # get user member access
    member_ids = (
        session.query(OrganisationMember)
        .filter(OrganisationMember.organisation == user.organisation)
        .all()
    )
    member_ids = [m.member_type for m in member_ids]
    member_access = (
        session.query(MemberType).filter(MemberType.id.in_(member_ids)).all()
    )
    member_access = [ma.name for ma in member_access] + ["All"]
    # get user isco access
    isco_ids = (
        session.query(OrganisationIsco)
        .filter(OrganisationIsco.organisation == user.organisation)
        .all()
    )
    isco_ids = [i.isco_type for i in isco_ids]
    isco_access = (
        session.query(IscoType).filter(IscoType.id.in_(isco_ids)).all()
    )
    isco_access = [ia.name for ia in isco_access] + ["All"]
    # forms
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
    # question available for computed val check
    computed_validation_questions = {}
    for qg in webform["question_group"]:
        qids = []
        computed_validation_tmp = []
        for q in qg["question"]:
            qid = q["id"]
            questions.update({qid: q})
            qids.append(qid)
            # user question filtered by qmember/isco
            user_question = set(member_access).intersection(
                set(q["member_access"])
            ) and set(isco_access).intersection(set(q["isco_access"]))
            if user_question and (
                q.get("core_mandatory") or q.get("coreMandatory")
            ):
                core_mandatory_questions.append(qid)
            if user_question:
                computed_validation_tmp.append(qid)
        qg["question"] = qids
        question_groups.append(qg)
        computed_validation_questions.update(
            {qg["id"]: computed_validation_tmp}
        )
    return {
        "form_name": webform["name"],
        "question_groups": question_groups,
        "questions": questions,
        "core_mandatory_questions": core_mandatory_questions,
        "computed_validation_questions": computed_validation_questions,
    }


def check_core_mandatory_questions_answer(
    published: dict, answers: List[AnswerDict], submitted: int
):
    core_mandatory_questions = published["core_mandatory_questions"]
    answer_qids = [a.get("question") for a in answers]
    # is core mandatory question answered
    if (
        submitted
        and core_mandatory_questions
        and not set(core_mandatory_questions).issubset(answer_qids)
    ):
        # not all core mandatory answered
        raise HTTPException(
            status_code=400,
            detail={
                "type": "core-mandatory-check",
                "message": "Please answer all core mandatory questions",
            },
        )


# TODO:: Enable to check for repeatable group
# def check_computed_validation(
#     form_id: int, answers: List[AnswerDict], submitted: int,
#     published: dict
# ):
#     # available question for user
#     available_questions = published["computed_validation_questions"]
#     TESTING = os.environ.get("TESTING")
#     BUCKET = BUCKET_FOLDER
#     if TESTING:
#         BUCKET = "notset"
#     # read computed validation config
#     json_file_path = f"{CONFIG_SOURCE_PATH}/{BUCKET}"
#     json_file_path = f"{json_file_path}/computed_validations.json"
#     with open(json_file_path, 'r') as j:
#         computed_validations = json.loads(j.read())
#     computed_validation = [
#         x for x in computed_validations
#         if int(x.get('form_id')) == form_id]
#     if computed_validation and submitted:
#         errors = []
#         computed_validation = computed_validation[0]
#         for cv in computed_validation.get('validations'):
#             cv_group = cv.get('group_id')
#             # check if question available
#             available_question = available_questions.get(cv_group)
#             if not available_question:
#                 continue
#             cv_qids = cv.get('question_ids')
#             # intersection qids with available question
#             cv_qids = list(
#                   set(cv_qids).intersection(set(available_question))
#               )
#             if not cv_qids:
#                 continue
#             cv_max = cv.get("max")
#             cv_min = cv.get("min")
#             cv_equal = cv.get("equal")
#             cv_answers = []
#             for a in answers:
#                 if not a.get('question') in cv_qids:
#                     continue
#                 value = a.get('value')
#                 if a.get('type') == QuestionType.number.value:
#                     value = int(value)
#                 cv_answers.append(value)
#             # round float total value
#             cv_answers = [x * 100 for x in cv_answers]
#             total_cv_answers = sum(cv_answers) / 100
#             if "max" in cv and total_cv_answers > cv_max:
#                 errors.append(cv)
#             if "min" in cv and total_cv_answers < cv_min:
#                 errors.append(cv)
#             if "equal" in cv and total_cv_answers != cv_equal:
#                 errors.append(cv)
#         if errors:
#             raise HTTPException(
#                 status_code=400,
#                 detail={
#                     "type": "computed-validation-check",
#                     "message": errors
#                 })


def notify_secretariat_admin(session: Session, user, form_name: str):
    organisation = crud_organisation.get_organisation_by_id(
        session=session, id=user.organisation
    )
    org_name = organisation.name
    # send to secretariat admin
    secretariat_admins = find_secretariat_admins(
        session=session, organisation=user.organisation
    )
    if secretariat_admins:
        body_secretariat = f"""{user.name} ({user.email}) from {org_name}
                            successfully submitted data for {form_name}.
                            """
        email_secretariat = Email(
            recipients=[a.recipient for a in secretariat_admins],
            type=MailTypeEnum.notify_submission_completed_to_secretariat_admin,
            body=body_secretariat,
        )
        email_secretariat.send


@data_route.get(
    "/data/form/{form_id:path}",
    response_model=DataResponseQuestionName,
    name="data:get",
    summary="get all datas filtered by form id",
    tags=["Data"],
)
def get(
    req: Request,
    page: int = 1,
    perpage: int = 10,
    form_id: Optional[Union[int, str]] = None,
    submitted: Optional[bool] = False,
    filter_same_isco: Optional[bool] = False,
    monitoring_round: Optional[int] = Query(None),
    organisation: Optional[List[int]] = Query(None),
    data_id: Optional[int] = Query(None),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    org_ids = []
    if filter_same_isco:
        org_ids = organisations_in_same_isco(
            session=session, organisation=user.organisation
        )
    if organisation:
        org_ids = organisation
    data = crud.get_data(
        session=session,
        form=form_id,
        skip=(perpage * (page - 1)),
        perpage=perpage,
        submitted=submitted,
        org_ids=org_ids,
        monitoring_round=monitoring_round,
        data_id=data_id,
    )
    if not data["count"]:
        raise HTTPException(status_code=404, detail="Not found")
    total_page = ceil(data["count"] / perpage) if data["count"] > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")

    # transform cascade answer value
    result = [d.serializeWithQuestionName for d in data["data"]]

    question_forms = [form_id]
    if form_id == "all":
        question_forms = [int(d.form) for d in data["data"]]

    questions = (
        session.query(Question)
        .filter(
            and_(
                Question.form.in_(question_forms),
                Question.type == QuestionType.cascade.value,
            )
        )
        .all()
    )
    # generate all cascades value based on answers
    cascade_qids = [q.id for q in questions]
    cascade_answers = []
    for res in result:
        for a in res["answer"]:
            if not a.get("value") or a.get("question") not in cascade_qids:
                continue
            cascade_answers += [int(float(x)) for x in a.get("value")]
    cascade_answers = set(cascade_answers)
    cascade_list = (
        session.query(CascadeList)
        .filter(CascadeList.id.in_(cascade_answers))
        .all()
    )
    cascades = {}
    for cl in cascade_list:
        cascades.update(({cl.id: cl.name}))

    # Query history datapoint
    history_data = {}
    for d in data["data"]:
        histories = crud.get_history_datapoint(
            session=session,
            form=d.form,
            data_id=d.id,
            organisation_id=d.organisation,
            submitted=d.submitted,
            last_year=d.submitted.year,
        )
        history_result = [
            h.serializeHistoryWithQuestionName for h in histories
        ]
        # transform cascade answer history value by cascade list
        for res in history_result:
            for a in res["answer"]:
                qid = a["question"]
                value = a["value"]
                if qid in cascade_qids and value:
                    new_value = [cascades.get(int(float(x))) for x in value]
                    a["value"] = (
                        "|".join(str(v) for v in new_value if v is not None)
                        if new_value
                        else value
                    )
        history_data[f"{d.organisation}-{d.created.year}"] = history_result

    # transform cascade answer value by cascade list
    for res in result:
        for a in res["answer"]:
            qid = a["question"]
            value = a["value"]
            if qid in cascade_qids and value:
                new_value = [cascades.get(int(float(x))) for x in value]
                a["value"] = (
                    "|".join(str(v) for v in new_value if v is not None)
                    if new_value
                    else value
                )
        # Add history answer
        res["history"] = history_data.get(
            f"{res['organisation']}-{res['year']}", []
        )
    return {
        "current": page,
        "data": result,
        "total": data["count"],
        "total_page": total_page,
    }


@data_route.post(
    "/data/form/{form_id}/{submitted:path}",
    response_model=DataDict,
    summary="add new data, collaborators contain organization id",
    name="data:create",
    tags=["Data"],
)
def add(
    req: Request,
    form_id: int,
    submitted: int,
    answers: List[AnswerDict],
    locked_by: Optional[int] = Query(None),
    collaborators: Optional[List[int]] = Query(None),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    user = verify_editor(
        session=session, authenticated=req.state.authenticated
    )
    # check if submission exist
    exist = crud.check_member_submission_exists(
        session=session, form=form_id, organisation=user.organisation
    )
    if exist:
        raise HTTPException(
            status_code=208, detail="Submission already reported"
        )
    # get questions from published form
    published = get_questions_from_published_form(
        session=session, form_id=form_id, user=User
    )
    questions = published["questions"]
    # end get questions published form

    # validate core mandatory & computed validation if submitted
    # check core mandatory question answered
    # TODO:: Enable this
    # check_core_mandatory_questions_answer(
    #     published=published, answers=answers, submitted=submitted
    # )
    # end check core mandatory question answered

    # validate by computed validations
    # TODO:: Enable this
    # check_computed_validation(
    #     form_id=form_id, answers=answers, submitted=submitted,
    #     published=published)
    ##
    # end validate by computed validations

    # generating answers
    geo = None
    answerlist = []
    for a in answers:
        q = questions[a["question"]]
        answer = Answer(
            question=q["id"],
            created=datetime.now(),
            repeat_index=a["repeat_index"],
            comment=a["comment"],
        )
        if q["type"] in [
            QuestionType.input.value,
            QuestionType.text.value,
            QuestionType.date.value,
            QuestionType.autofield.value,
        ]:
            answer.text = a["value"]
        if q["type"] == QuestionType.number.value:
            answer.value = a["value"]
        if q["type"] == QuestionType.option.value:
            value = a.get("value", 0)
            value = convert_single_option_value(value=value)
            answer.options = [value]
        if q["type"] == QuestionType.multiple_option.value:
            answer.options = a["value"]
        if q["type"] == QuestionType.cascade.value:
            answer.options = a["value"]
        if q["type"] == QuestionType.nested_list.value or q["type"] == "tree":
            answer.options = a["value"]
        answerlist.append(answer)
    name = generate_datapoint_name(
        session=session, form=form_id, answers=answers
    )
    data = crud.add_data(
        session=session,
        form=form_id,
        name=name or "",
        geo=geo,
        locked_by=locked_by,
        created_by=user.id,
        organisation=user.organisation,
        answers=answerlist,
        submitted=submitted,
    )
    # if collaborators added for the first time
    # handling this for prefilled project questionnaire
    # if prefilled project questionnaire,
    # we should send collaborators as query params from FE
    if collaborators:
        for org_id in collaborators:
            crud_collaborator.add_collaborator(
                session=session, data=data.id, payload={"organisation": org_id}
            )
        send_collaborator_email(
            session=session, user=user, recipient_org_ids=collaborators
        )
    # if submitted send notification email to secretariat admin
    if submitted:
        notify_secretariat_admin(
            session=session, user=user, form_name=published["form_name"]
        )
    return data.serialize


@data_route.get(
    "/data/saved",
    response_model=List[DataOptionDict],
    summary="get saved data by login user organisation",
    name="data:get_saved_data_by_organisation",
    tags=["Data"],
)
def get_saved_data_by_organisation(
    req: Request,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    user = verify_editor(
        session=session, authenticated=req.state.authenticated
    )
    # get saved data from logged user organisation
    data = crud.get_data_by_organisation(
        session=session, organisation=user.organisation, submitted=False
    )
    # check for collaborator
    collabs = crud_collaborator.get_collaborator_by_organisation(
        session=session, organisation=user.organisation
    )
    if collabs:
        collab_data = crud.get_data_by_ids(
            session=session, ids=[c.only_data_id for c in collabs]
        )
        data = [*data, *collab_data]
    if not data:
        return []
    options_value = [d.to_options for d in data]
    for item in options_value:
        if not item.get("is_name_configured"):
            # check and regenerate datapoint/display name
            new_name = generate_datapoint_name(
                session=session, form=item.get("form"), data=item.get("id")
            )
            name = item.get("name")
            if new_name:
                created = item.get("created")
                created_by = item.get("created_by")
                name = f"{new_name} - {created_by} - {created}"
            item.update({"name": name})
    return options_value


@data_route.put(
    "/data/unsubmit/{id}",
    response_model=DataDict,
    summary="undo data submission",
    name="data:unsubmit",
    tags=["Data"],
)
def undo_submission(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    data = crud.get_data_by_id(session=session, id=id, submitted=True)
    if not data:
        raise HTTPException(
            status_code=404, detail="data {} is not found".format(id)
        )
    if data.submitted and data.submitted.year != datetime.now().year:
        raise HTTPException(
            status_code=401, detail="Undo submission is not allowed"
        )
    data.submitted = None
    data.submitted_by = None
    data = crud.update_data(session=session, data=data)
    # TODO::Send an email to the member submitter and member admin
    # (if any and only one if submitter and member admin is the same user)
    # Only implement this after Joy have discussed it with the ISCO's]
    member_submitter = data.created_by_user.email
    member_admins = find_member_admins(
        session=session, organisation=data.organisation
    )
    member_admin_email = [ma.email for ma in member_admins]
    if member_submitter in member_admin_email:
        # send only to member admin
        pass
    else:
        # send email to member admin and member submitter
        pass
    return data.serialize


@data_route.get(
    "/data/{id:path}",
    response_model=DataDict,
    summary="get data by id",
    name="data:get_by_id",
    tags=["Data"],
)
def get_by_id(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    data = crud.get_data_by_id(session=session, id=id)
    if not data:
        raise HTTPException(
            status_code=404, detail="data {} is not found".format(id)
        )
    return data.serialize


@data_route.delete(
    "/data/{id:path}",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="delete data",
    name="data:delete",
    tags=["Data"],
)
def delete(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
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
    tags=["Data"],
)
def bulk_delete(
    req: Request,
    id: Optional[List[int]] = Query(None),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    crud.delete_bulk(session=session, ids=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@data_route.put(
    "/data/{id}/{submitted:path}",
    response_model=DataDict,
    summary="update data",
    name="data:update",
    tags=["Data"],
)
def update_by_id(
    req: Request,
    id: int,
    submitted: int,
    answers: List[AnswerDict],
    locked_by: Optional[int] = None,
    data_cleaning: Optional[bool] = False,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    # data cleaning verify super admin/secretariat admin
    if data_cleaning:
        user = verify_super_admin(
            session=session, authenticated=req.state.authenticated
        )
    if not data_cleaning:
        user = verify_editor(
            session=session, authenticated=req.state.authenticated
        )
    # check data status before update
    # to prevent update submitted data
    data = crud.get_data_by_id(
        session=session, id=id, submitted=True if data_cleaning else False
    )
    if not data:
        raise HTTPException(
            status_code=208, detail="Submission already reported"
        )
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
        session=session, form_id=data.form, user=user
    )
    question_groups = published["question_groups"]
    questions = published["questions"]
    # end get questions published form

    # validate core mandatory & computed validation if submitted
    # check core mandatory question answered
    # TODO:: Enable this
    # check_core_mandatory_questions_answer(
    #     published=published, answers=answers, submitted=submitted
    # )
    # end check core mandatory question answered

    # validate by computed validations
    # TODO:: Enable this
    # check_computed_validation(
    #     form_id=data.form, answers=answers, submitted=submitted,
    #     published=published)
    ##
    # end validate by computed validations

    # get repeatable question ids
    repeat_qids = []
    for qg in question_groups:
        if qg["repeatable"] is True:
            for qid in qg["question"]:
                repeat_qids.append(qid)
    # questions = form.list_of_questions

    checked = {}
    checked_payload = {}
    answer_payload_ids_with_repeat_index = []  # for DELETE answer

    # if data_cleaning, delete old answer and save payload
    answer_ids = []
    if data_cleaning:
        current_repeat = []
        answers_to_delete = (
            session.query(Answer).filter(Answer.data == data.id).all()
        )
        answer_ids = [a.id for a in answers_to_delete]

    if not data_cleaning:
        # get current repeat group answer
        current_repeat = crud_answer.get_answer_by_data_and_question(
            session=session, data=data.id, questions=repeat_qids
        )

        current_answers = crud_answer.get_answer_by_data_and_question(
            session=session,
            data=id,
            questions=[a["question"] for a in answers],
        )

        # dict key is pair of questionid_repeat_index
        [checked.update(a.to_dict) for a in current_answers]

    for a in answers:
        key = f"{a['question']}_{a['repeat_index']}"
        answer_payload_ids_with_repeat_index.append(key)  # for DELETE answer
        checked_payload.update({key: a})
        execute = "update"
        if a["question"] not in list(questions):
            raise HTTPException(
                status_code=401,
                detail="question {} is not part of this form".format(
                    a["question"]
                ),
            )
        qtype = questions[a["question"]]["type"]
        a.update({"type": qtype})
        last_answer = []
        if key in list(checked):
            execute = "update"
            last_answer = checked[key]
        else:
            execute = "new"
        if execute == "update" and (
            a["value"] != last_answer["value"]
            or a["comment"] != last_answer["comment"]
        ):
            answer = last_answer["data"]
            a = crud_answer.update_answer(
                session=session,
                answer=answer,
                repeat_index=a["repeat_index"],
                comment=a["comment"],
                type=qtype,
                value=a["value"],
            )
        if execute == "new":
            answer = Answer(
                question=a["question"],
                data=data.id,
                created=datetime.now(),
                repeat_index=a["repeat_index"],
                comment=a["comment"],
            )
            a = crud_answer.add_answer(
                session=session, answer=answer, type=qtype, value=a["value"]
            )
        if execute:
            name = generate_datapoint_name(
                session=session, form=data.form, answers=answers
            )
            data.name = name or ""
            # don't update locked_by for data_cleaning
            data.locked_by = locked_by if not data_cleaning else data.locked_by
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
            crud_answer.delete_answer_by_id(session=session, id=c["id"])
    # delete old answer after insert
    if data_cleaning and answer_ids:
        session.query(Answer).filter(Answer.id.in_(answer_ids)).delete(
            synchronize_session="fetch"
        )
        session.commit()

    # HANDLE DELETE
    # need to check if current answers in DB not available
    # in answers payload (that mean DELETE)
    if not data_cleaning:
        all_answers = crud_answer.get_answer_by_data(session=session, data=id)
        all_answers = [a.format_with_answer_id for a in all_answers]
        for a in all_answers:
            key = f"{a['question']}_{a['repeat_index']}"
            if key in answer_payload_ids_with_repeat_index:
                # ignore
                continue
            # delete answer
            crud_answer.delete_answer_by_id(session=session, id=a["id"])
    # EOL handle DELETE

    # if submitted send and not
    # data_cleaning notification email to secretariat admin
    if submitted and not data_cleaning:
        notify_secretariat_admin(
            session=session, user=user, form_name=published["form_name"]
        )
    return data.serialize


@data_route.get(
    "/submission/progress",
    response_model=List[SubmissionProgressDict],
    name="submission:progress",
    summary="view submission progress",
    tags=["Data"],
)
def get_submission_progress(
    req: Request,
    not_submitted: Optional[bool] = False,
    form_id: Optional[List[int]] = Query([]),
    organisation: Optional[List[int]] = Query([]),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    admin = verify_super_admin(
        session=session, authenticated=req.state.authenticated
    )
    org_ids = organisations_in_same_isco(
        session=session, organisation=admin.organisation
    )
    # validate if organisation param not in same isco
    if organisation and not list(set(org_ids) & set(organisation)):
        raise HTTPException(status_code=403, detail="Forbidden access")
    if organisation:
        org_ids = organisation
    # filter by monitoring round (current year)
    current_year = get_prev_year(prev=0, year=True)
    data = session.query(
        Data.organisation,
        Data.form,
        Data.submitted,
        func.count(Data.id).label("count"),
    ).filter(
        and_(
            Data.organisation.in_(org_ids),
            extract("year", Data.created) == current_year,
        )
    )
    if form_id:
        data = data.filter(Data.form.in_(form_id))
    if not_submitted:
        data = data.filter(Data.submitted == null())
    data = data.group_by(Data.organisation, Data.form, Data.submitted).all()
    if not data:
        return []
    organisations = (
        session.query(Organisation).filter(Organisation.id.in_(org_ids)).all()
    )
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
        res.append(
            {
                "organisation": orgs_dict[d.organisation],
                "form": d.form,
                "form_type": form_type,
                "submitted": True if d.submitted else False,
                "count": d.count,
            }
        )
    # TODO :: Delete this, related to issue #466
    # filters organisations that has not "submitted" any questionnaire
    # if not_submitted:
    # # defined member = [org] and project = [org]
    # # to show organisation if there's no submission for member yet
    # temp = {}
    # for x in res:
    #     if x["form_type"] in temp:
    #         temp[x["form_type"]].append(x["organisation"])
    #     else:
    #         temp.update({x["form_type"]: [x["organisation"]]})
    # member_submitted = {}
    # for x in res:
    #     if x["form"] in MEMBER_SURVEY and x["submitted"]:
    #         member_submitted.update({x["organisation"]: True})
    # filter_orgs = {}  # not submitted temp
    # for x in res:
    #     if (
    #         x["form"] in MEMBER_SURVEY
    #         and not x["submitted"]
    #         and x["organisation"] not in member_submitted
    #     ):
    #         filter_orgs.update({x["organisation"]: True})
    # filtered = []
    # for x in res:
    #     org = x["organisation"]
    #     if org in filter_orgs and filter_orgs[org]:
    #         filtered.append(x)
    #     if "member" in temp and org not in temp["member"]:
    #         filtered.append(x)
    # return filtered
    # EOL delete
    return res
