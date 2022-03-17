from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from typing import List
from sqlalchemy.orm import Session
import db.crud_skip_logic as crud
from db.connection import get_session
from models.skip_logic import SkipLogicDict, SkipLogicPayload
from models.skip_logic import OperatorType

skip_logic_route = APIRouter()


@skip_logic_route.post("/skip_logic",
                       response_model=SkipLogicDict,
                       summary="add new skip logic",
                       name="skip_logic:create",
                       tags=["Skip Logic"])
def add(req: Request, payload: SkipLogicPayload,
        session: Session = Depends(get_session)):
    skip_logic = crud.add_skip_logic(session=session, payload=payload)
    return skip_logic.serialize


@skip_logic_route.get("/skip_logic/",
                      response_model=List[SkipLogicDict],
                      summary="get all skip logics",
                      name="skip_logic:get_all",
                      tags=["Skip Logic"])
def get(req: Request, session: Session = Depends(get_session)):
    skip_logic = crud.get_skip_logic(session=session)
    return [sl.serialize for sl in skip_logic]


@skip_logic_route.get("/skip_logic/operator",
                      response_model=List,
                      summary="get all skip logic operators",
                      name="skip_logic:get_all_operator",
                      tags=["Skip Logic"])
def get_operator(req: Request, session: Session = Depends(get_session)):
    return [sl.value for sl in OperatorType]


@skip_logic_route.get("/skip_logic/{id:path}",
                      response_model=SkipLogicDict,
                      summary="get skip logic by id",
                      name="skip_logic:get_by_id",
                      tags=["Skip Logic"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    skip_logic = crud.get_skip_logic_by_id(session=session, id=id)
    return skip_logic.serialize


@skip_logic_route.put("/skip_logic/{id:path}",
                      response_model=SkipLogicDict,
                      summary="update skip logic",
                      name="skip_logic:put",
                      tags=["Skip Logic"])
def update(req: Request, id: int, payload: SkipLogicPayload,
           session: Session = Depends(get_session)):
    skip_logic = crud.update_skip_logic(session=session,
                                        id=id,
                                        payload=payload)
    return skip_logic.serialize


@skip_logic_route.delete("/skip_logic/{id:path}",
                         responses={204: {
                             "model": None
                            }},
                         status_code=HTTPStatus.NO_CONTENT,
                         summary="delete skip logic by id",
                         name="skip_logic:delete",
                         tags=["Skip Logic"])
def delete(req: Request, id: int, session: Session = Depends(get_session)):
    crud.delete_skip_logic(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
