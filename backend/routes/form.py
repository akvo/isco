import os
import json
import requests as r
from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy import null
from sqlalchemy.orm import Session
import db.crud_form as crud
from db.crud_data import check_member_submission_exists, get_data_by_id
from db.crud_data import get_data_by_form
from db.crud_answer import get_answer_by_question
from db.connection import get_session
from models.form import FormBase, FormDict, FormDictWithGroupStatus
from models.form import FormPayload, FormJson, FormOptions, Form
from middleware import verify_super_admin, verify_editor

security = HTTPBearer()
form_route = APIRouter()


@form_route.post(
    "/form",
    response_model=FormDict,
    summary="add new form",
    name="form:create",
    tags=["Form"],
)
def add(
    req: Request,
    payload: FormPayload,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    form = crud.add_form(session=session, payload=payload)
    return form.serialize


@form_route.get(
    "/form/",
    response_model=List[FormDictWithGroupStatus],
    summary="get all forms",
    name="form:get_all",
    tags=["Form"],
)
def get(
    req: Request,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
):
    form = crud.get_form(session=session, search=search)
    return [f.serializeWithGroupStatus for f in form]


@form_route.get(
    "/form/published",
    response_model=List[FormOptions],
    summary="get all published form",
    name="form:get_published",
    tags=["Form"],
)
def get_published_form(req: Request, session: Session = Depends(get_session)):
    forms = session.query(Form).filter(Form.published != null()).all()
    return [f.to_options for f in forms]


@form_route.put(
    "/form/{id:path}",
    response_model=FormDict,
    summary="update form",
    name="form:put",
    tags=["Form"],
)
def update(
    req: Request,
    id: int,
    payload: FormPayload,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    form = crud.update_form(session=session, id=id, payload=payload)
    return form.serialize


@form_route.get(
    "/form/transform/{form_id}",
    response_model=FormJson,
    summary="transform form value by form id",
    name="form:transform",
    tags=["Form"],
)
def transform_form_by_id(
    req: Request, form_id: int, session: Session = Depends(get_session)
):
    form = crud.generate_webform_json(session=session, id=form_id)
    return form


@form_route.get(
    "/form/{id:path}",
    response_model=FormBase,
    summary="get form by id",
    name="form:get_by_id",
    tags=["Form"],
)
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    form = crud.get_form_by_id(session=session, id=id)
    return form.serialize


@form_route.post(
    "/form/publish",
    response_model=FormDict,
    summary="publish a form",
    name="form:publish",
    tags=["Form"],
)
def publish_form_by_id(
    req: Request,
    form_id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    form = crud.publish_form(session=session, id=form_id)
    return form.serialize


@form_route.delete(
    "/form/delete_from_bucket/{form_id}",
    response_model=FormDict,
    summary="delete json from bucket",
    name="form:delete_publish",
    tags=["Form"],
)
def delete_publish_form_by_id(
    req: Request,
    form_id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    form = crud.delete_publish_form(session=session, id=form_id)
    return form.serialize


@form_route.delete(
    "/form/{id:path}",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="delete form by id",
    name="form:delete",
    tags=["Form"],
)
def delete(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    # check if form has datapoint
    has_datapoint = get_data_by_form(session=session, form=id)
    if has_datapoint:
        return JSONResponse(
            status_code=HTTPStatus.BAD_REQUEST.value,
            content={"message": "This survey has submission."},
        )
    crud.delete_form(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@form_route.get(
    "/survey_editor/{form_id:path}",
    response_model=FormBase,
    summary="load survey editor data by id",
    name="form:get_survey_editor_by_id",
    tags=["Form"],
)
def get_survey_editor_by_id(
    req: Request, form_id: int, session: Session = Depends(get_session)
):
    form = crud.get_form_by_id(session=session, id=form_id)
    form = form.serialize
    for qg in form.get("question_group"):
        for q in qg.get("question"):
            check_answer = get_answer_by_question(
                session=session, question=[q.get("id")]
            )
            q.update({"disableDelete": True if check_answer else False})
    return form


@form_route.get(
    "/webform/options",
    response_model=List[FormOptions],
    summary="load form options value",
    name="form:get_webform_options",
    tags=["Form"],
)
def get_form_options(
    req: Request,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    user = verify_editor(
        session=session, authenticated=req.state.authenticated
    )
    questionnaires = []
    if user.questionnaires:
        questionnaires = user.questionnaires
    # filter by user questionnaires
    forms = (
        session.query(Form)
        .filter(Form.published != null())
        .filter(Form.id.in_(questionnaires))
        .all()
    )
    forms = [f.to_options for f in forms]
    # check if user organisation already have a member survey saved/submitted
    for f in forms:
        exists = check_member_submission_exists(
            session=session, organisation=user.organisation, form=f["value"]
        )
        if exists:
            f["disabled"] = True
            f["label"] = f"{f['label']}"
    return forms


@form_route.get(
    "/webform/{form_id}",
    summary="load form form bucket",
    name="form:get_webform_from_bucket",
    tags=["Form"],
)
def get_form_from_bucket(
    req: Request,
    form_id: int,
    data_id: Optional[int] = None,
    data_cleaning: Optional[bool] = False,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    if data_cleaning:
        user = verify_super_admin(
            session=session, authenticated=req.state.authenticated
        )
    if not data_cleaning:
        user = verify_editor(
            session=session, authenticated=req.state.authenticated
        )
    # check if user organisation already have a member survey saved/submitted
    exists = check_member_submission_exists(
        session=session,
        form=form_id,
        organisation=user.organisation,
        saved=True,
    )
    # if data cleaning True, allow to access form
    if exists and not data_cleaning:
        raise HTTPException(
            status_code=208, detail="Submission already reported"
        )
    form = crud.get_form_by_id(session=session, id=form_id)
    TESTING = os.environ.get("TESTING")
    if TESTING:
        webform = json.load(open(form.url))
    else:
        webform = r.get(form.url)
        webform = webform.json()
    results = {"form": webform}
    if data_id:
        data = get_data_by_id(
            session=session,
            id=data_id,
            submitted=False if not data_cleaning else True,
        )
        if not data:
            raise HTTPException(
                status_code=208, detail="Submission already reported"
            )
        results.update({"initial_values": data.serialize})
    return results
