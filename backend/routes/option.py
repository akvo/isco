from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from typing import List
from sqlalchemy.orm import Session
import db.crud_option as crud
from db.connection import get_session
from models.option import OptionBase, OptionDict, OptionPayload

option_route = APIRouter()


@option_route.post("/option",
                   response_model=OptionDict,
                   summary="add new option",
                   name="option:create",
                   tags=["Option"])
def add(req: Request, payload: OptionPayload,
        session: Session = Depends(get_session)):
    option = crud.add_option(session=session, payload=payload)
    return option.serialize


@option_route.get("/option/",
                  response_model=List[OptionDict],
                  summary="get all options",
                  name="option:get_all",
                  tags=["Option"])
def get(req: Request, session: Session = Depends(get_session)):
    option = crud.get_option(session=session)
    return [o.serialize for o in option]


@option_route.get("/option/{id:path}",
                  response_model=OptionBase,
                  summary="get option by id",
                  name="option:get_by_id",
                  tags=["Option"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    option = crud.get_option_by_id(session=session, id=id)
    return option.serialize


@option_route.put("/option/{id:path}",
                  response_model=OptionDict,
                  summary="update option",
                  name="option:put",
                  tags=["Option"])
def update(req: Request, id: int, payload: OptionPayload,
           session: Session = Depends(get_session)):
    option = crud.update_option(session=session, id=id, payload=payload)
    return option.serialize


@option_route.delete("/option/{id:path}",
                     responses={204: {
                       "model": None
                       }},
                     status_code=HTTPStatus.NO_CONTENT,
                     summary="delete option by id",
                     name="option:delete",
                     tags=["Option"])
def delete(req: Request, id: int, session: Session = Depends(get_session)):
    crud.delete_option(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
