import requests as r
from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy import or_, null
from sqlalchemy.orm import Session
import db.crud_form as crud
from db.crud_data import check_member_submission_exists
from db.connection import get_session
from models.form import FormBase, FormDict, FormDictWithGroupStatus
from models.form import FormPayload, FormJson, FormOptions, Form
from middleware import verify_super_admin, verify_editor
from util.survey_config import MEMBER_SURVEY, PROJECT_SURVEY

security = HTTPBearer()
form_route = APIRouter()


@form_route.post("/form",
                 response_model=FormDict,
                 summary="add new form",
                 name="form:create",
                 tags=["Form"])
def add(req: Request, payload: FormPayload,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    form = crud.add_form(session=session, payload=payload)
    return form.serialize


@form_route.get("/form/",
                response_model=List[FormDictWithGroupStatus],
                summary="get all forms",
                name="form:get_all",
                tags=["Form"])
def get(req: Request, session: Session = Depends(get_session)):
    form = crud.get_form(session=session)
    return [f.serializeWithGroupStatus for f in form]


@form_route.put("/form/{id:path}",
                response_model=FormDict,
                summary="update form",
                name="form:put",
                tags=["Form"])
def update(req: Request, id: int, payload: FormPayload,
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    form = crud.update_form(session=session, id=id, payload=payload)
    return form.serialize


@form_route.get("/form/transform/{form_id}",
                response_model=FormJson,
                summary="transform form value by form id",
                name="form:transform",
                tags=["Form"])
def transform_form_by_id(req: Request, form_id: int,
                         session: Session = Depends(get_session)):
    form = crud.generate_webform_json(session=session, id=form_id)
    return form


@form_route.get("/form/{id:path}",
                response_model=FormBase,
                summary="get form by id",
                name="form:get_by_id",
                tags=["Form"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    form = crud.get_form_by_id(session=session, id=id)
    return form.serialize


@form_route.post("/form/publish",
                 response_model=FormDict,
                 summary="publish a form",
                 name="form:publish",
                 tags=["Form"])
def publish_form_by_id(req: Request, form_id: int,
                       session: Session = Depends(get_session),
                       credentials: credentials = Depends(security)):
    form = crud.publish_form(session=session, id=form_id)
    return form.serialize


@form_route.delete("/form/delete_from_bucket/{form_id}",
                   response_model=FormDict,
                   summary="delete json from bucket",
                   name="form:delete_publish",
                   tags=["Form"])
def delete_publish_form_by_id(req: Request, form_id: int,
                              session: Session = Depends(get_session),
                              credentials: credentials = Depends(security)):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    form = crud.delete_publish_form(session=session, id=form_id)
    return form.serialize


@form_route.delete("/form/{id:path}",
                   responses={204: {
                       "model": None
                    }},
                   status_code=HTTPStatus.NO_CONTENT,
                   summary="delete form by id",
                   name="form:delete",
                   tags=["Form"])
def delete(req: Request, id: int, session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    crud.delete_form(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@form_route.get("/survey_editor/{form_id:path}",
                response_model=FormBase,
                summary="load survey editor data by id",
                name="form:get_survey_editor_by_id",
                tags=["Form"])
def get_survey_editor_by_id(req: Request, form_id: int,
                            session: Session = Depends(get_session)):
    form = crud.get_form_by_id(session=session, id=form_id)
    return form.serialize


@form_route.get("/webform/list",
                response_model=List[FormOptions],
                summary="load form options value",
                name="form:get_webform_options",
                tags=["Form"])
def get_form_options(req: Request, session: Session = Depends(get_session),
                     credentials: credentials = Depends(security)):
    user = verify_editor(session=session,
                         authenticated=req.state.authenticated)
    # check if user organisation already have a member survey saved/submitted
    exists = check_member_submission_exists(session=session,
                                            organisation=user.organisation)
    forms = session.query(Form).filter(
        Form.published != null()).filter(or_(
            Form.id.in_(MEMBER_SURVEY),
            Form.id.in_(PROJECT_SURVEY),)).all()
    forms = [f.to_options for f in forms]
    if exists:
        for f in forms:
            if f['value'] in MEMBER_SURVEY:
                f['disabled'] = True
    return forms


@form_route.get("/webform/{form_id}",
                summary="load form form bucket",
                name="form:webform",
                tags=["Form"])
def get_form_from_bucket(req: Request, form_id: int,
                         session: Session = Depends(get_session),
                         credentials: credentials = Depends(security)):
    user = verify_editor(session=session,
                         authenticated=req.state.authenticated)
    # check if user organisation already have a member survey saved/submitted
    exists = check_member_submission_exists(session=session,
                                            organisation=user.organisation)
    if exists:
        raise HTTPException(status_code=208,
                            detail="Submission already reported")
    form = crud.get_form_by_id(session=session, id=form_id)
    webform = r.get(form.url)
    return webform.json()
