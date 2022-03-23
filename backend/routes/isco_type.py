from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_isco_type as crud
from db.connection import get_session
from models.isco_type import IscoTypeBase
from models.isco_type import IscoTypeDict, IscoTypePayload

security = HTTPBearer()
isco_type_route = APIRouter()


@isco_type_route.post("/isco_type",
                      response_model=IscoTypeDict,
                      summary="add new member type",
                      name="isco_type:create",
                      tags=["Isco Type"])
def add(req: Request, payload: IscoTypePayload,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    isco_type = crud.add_isco_type(session=session, payload=payload)
    return isco_type.serialize


@isco_type_route.get("/isco_type/",
                     response_model=List[IscoTypeDict],
                     summary="get all member types",
                     name="isco_type:get_all",
                     tags=["Isco Type"])
def get(req: Request, session: Session = Depends(get_session)):
    isco_type = crud.get_isco_type(session=session)
    return [mt.serialize for mt in isco_type]


@isco_type_route.get("/isco_type/{id:path}",
                     response_model=IscoTypeBase,
                     summary="get member type by id",
                     name="isco_type:get_by_id",
                     tags=["Isco Type"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    isco_type = crud.get_isco_type_by_id(session=session, id=id)
    return isco_type.serialize


@isco_type_route.put("/isco_type/{id:path}",
                     response_model=IscoTypeDict,
                     summary="update member type",
                     name="isco_type:put",
                     tags=["Isco Type"])
def update(req: Request, id: int, payload: IscoTypePayload,
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    isco_type = crud.update_isco_type(session=session,
                                      id=id,
                                      payload=payload)
    return isco_type.serialize


@isco_type_route.delete("/isco_type/{id:path}",
                        responses={204: {
                            "model": None
                        }},
                        status_code=HTTPStatus.NO_CONTENT,
                        summary="delete member type by id",
                        name="isco_type:delete",
                        tags=["Isco Type"])
def delete(req: Request, id: int, session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    crud.delete_isco_type(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
