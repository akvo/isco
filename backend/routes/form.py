from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_form as crud
import db.crud_option as crud_option
from db.connection import get_session
from models.form import FormBase, FormDict, FormDictWithGroupStatus
from models.form import FormPayload, FormJson
from models.question import QuestionType

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
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
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


def get_order(data):
    return data['order']


@form_route.get("/webform/{form_id:path}",
                response_model=FormJson,
                summary="load webform json by form id",
                name="form:get_webform_by_id",
                tags=["Form"])
def get_webform_by_id(req: Request, form_id: int,
                      session: Session = Depends(get_session)):
    form = crud.get_form_by_id(session=session, id=form_id)
    form = form.serializeJson

    # Sort question group by order
    form['question_group'].sort(key=get_order)
    for qg in form['question_group']:
        # Sort question by order
        qg['question'].sort(key=get_order)
        for q in qg['question']:
            # Sort option by order
            q['option'].sort(key=get_order)
            # Transform dependency
            for d in q['dependency']:
                if d['type'] == QuestionType.option.value:
                    ids = d['value'].split('|')
                    option = crud_option.get_option_by_ids(session=session,
                                                           ids=ids)
                    option = [opt.optionName for opt in option]
                    d['options'] = option
                    del d['value']
                    del d['operator']
                if d['type'] == QuestionType.number.value:
                    d['value'] = int(d['value'])

    return form
