from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from typing import List
from sqlalchemy.orm import Session
import db.crud_form as crud
from db.connection import get_session
from models.form import FormBase, FormDict
from models.form import FormPayload, FormJson

form_route = APIRouter()


@form_route.post("/form",
                 response_model=FormDict,
                 summary="add new form",
                 name="form:create",
                 tags=["Form"])
def add(req: Request, payload: FormPayload,
        session: Session = Depends(get_session)):
    form = crud.add_form(session=session, payload=payload)
    return form.serialize


@form_route.get("/form/",
                response_model=List[FormDict],
                summary="get all forms",
                name="form:get_all",
                tags=["Form"])
def get(req: Request, session: Session = Depends(get_session)):
    form = crud.get_form(session=session)
    return [f.serialize for f in form]


@form_route.get("/form/{id:path}",
                response_model=FormBase,
                summary="get form by id",
                name="form:get_by_id",
                tags=["Form"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    form = crud.get_form_by_id(session=session, id=id)
    return form.serialize


@form_route.put("/form/{id:path}",
                response_model=FormDict,
                summary="update form",
                name="form:put",
                tags=["Form"])
def update(req: Request, id: int, payload: FormPayload,
           session: Session = Depends(get_session)):
    form = crud.update_form(session=session, id=id, payload=payload)
    return form.serialize


@form_route.delete("/form/{id:path}",
                   responses={204: {
                       "model": None
                    }},
                   status_code=HTTPStatus.NO_CONTENT,
                   summary="delete form by id",
                   name="form:delete",
                   tags=["Form"])
def delete(req: Request, id: int, session: Session = Depends(get_session)):
    crud.delete_form(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@form_route.get("/webform/{form_id:path}",
                response_model=FormJson,
                summary="load webform json by form id",
                name="form:get_webform_by_id",
                tags=["Form"])
def get_webform_by_id(req: Request, form_id: int,
                      session: Session = Depends(get_session)):
    form = crud.get_form_by_id(session=session, id=form_id)
    return form.serialize
