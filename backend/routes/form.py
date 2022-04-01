import requests as r
from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_form as crud
from db.connection import get_session
from models.form import FormBase, FormDict, FormDictWithGroupStatus
from models.form import FormPayload, FormJson
from middleware import verify_super_admin

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


@form_route.get("/survey_editor/{form_id:path}",
                response_model=FormBase,
                summary="load survey editor data by id",
                name="form:get_survey_editor_by_id",
                tags=["Form"])
def get_survey_editor_by_id(req: Request, form_id: int,
                            session: Session = Depends(get_session)):
    form = crud.get_form_by_id(session=session, id=form_id)
    return form.serialize


@form_route.get("/webform/{form_id}",
                summary="load form form bucket",
                name="form:webform",
                tags=["Form"])
def get_form_from_bucket(req: Request, form_id: int,
                         session: Session = Depends(get_session)):
    form = crud.get_form_by_id(session=session, id=form_id)
    webform = r.get(form.url)
    return webform.json()


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
