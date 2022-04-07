from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_cascade as crud
from db.connection import get_session
from models.cascade import CascadeBase, CascadeDict, CascadePayload
from models.cascade_list import CascadeListPayload, CascadeListBase
from models.cascade_list import CascadeListDict

security = HTTPBearer()
cascade_route = APIRouter()


# Cascade


@cascade_route.post("/cascade",
                    response_model=CascadeBase,
                    summary="add new cascade",
                    name="cascade:create",
                    tags=["Cascade"])
def add(req: Request, cascade: CascadePayload,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    cascade = crud.add_cascade(session=session, payload=cascade)
    return cascade.serialize


@cascade_route.get("/cascade/",
                   response_model=List[CascadeDict],
                   summary="get all cascades",
                   name="cascade:get_all",
                   tags=["Cascade"])
def get(req: Request, session: Session = Depends(get_session)):
    cascade = crud.get_cascade(session=session)
    return [c.serialize for c in cascade]


@cascade_route.get("/nested/list",
                   response_model=dict,
                   summary="get nested list by cascade_id ex: 1|2|3",
                   name="nested_list:get_tree_value",
                   tags=["Cascade"])
def get_nested_list_by_cascade_id(req: Request, cascade_id: str,
                                  transform: Optional[int] = 1,
                                  session: Session = Depends(get_session)):
    ids = cascade_id.split("|")
    data = crud.get_cascade_list_by_cascade_id(session=session,
                                               cascade_id=ids,
                                               transform=transform)
    return data


@cascade_route.get("/cascade/list/{cascade_id:path}/{path:path}",
                   response_model=List[dict],
                   summary="get cascade list by cascade id and path",
                   name="cascade_list:get_by_cascade_id_and_path",
                   tags=["Cascade"])
def get_cascade_list_by_cascade_id_path(req: Request,
                                        cascade_id: int, path: int,
                                        session: Session = Depends(
                                            get_session)):
    clist = crud.get_cascade_list_by_cascade_id_path(
        session=session, cascade_id=cascade_id, path=path)
    return [c.serializeWithoutChildren for c in clist]


@cascade_route.get("/cascade/{id:path}",
                   response_model=CascadeBase,
                   summary="get cascade by id",
                   name="cascade:get_by_id",
                   tags=["Cascade"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    cascade = crud.get_cascade_by_id(session=session, id=id)
    return cascade.serialize


@cascade_route.put("/cascade/{id:path}",
                   response_model=CascadeDict,
                   summary="update cascade",
                   name="cascade:put",
                   tags=["Cascade"])
def update(req: Request, id: int, payload: CascadePayload,
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    cascade = crud.update_cascade(session=session, id=id, payload=payload)
    return cascade.serialize


@cascade_route.delete("/cascade/{id:path}",
                      responses={204: {
                          "model": None
                        }},
                      status_code=HTTPStatus.NO_CONTENT,
                      summary="delete cascade by id",
                      name="cascade:delete",
                      tags=["Cascade"])
def delete(req: Request, id: int, session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    crud.delete_cascade(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


# Cascade List


@cascade_route.post("/cascade_list",
                    response_model=CascadeListBase,
                    summary="add new cascade list",
                    name="cascade_list:create",
                    tags=["Cascade"])
def add_cascade_list(req: Request, payload: CascadeListPayload,
                     session: Session = Depends(get_session),
                     credentials: credentials = Depends(security)):
    clist = crud.add_cascade_list(session=session, payload=payload)
    return clist.serialize


@cascade_route.get("/cascade_list/{id:path}",
                   response_model=CascadeListDict,
                   summary="get cascade list by id",
                   name="cascade_list:get_by_id",
                   tags=["Cascade"])
def get_cascade_list_by_id(req: Request, id: int,
                           session: Session = Depends(get_session)):
    clist = crud.get_cascade_list_by_id(session=session, id=id)
    return clist.serialize


@cascade_route.put("/cascade_list/{id:path}",
                   response_model=CascadeListBase,
                   summary="update cascade list",
                   name="cascade_list:put",
                   tags=["Cascade"])
def update_cascade_list(req: Request, id: int, payload: CascadeListPayload,
                        session: Session = Depends(get_session),
                        credentials: credentials = Depends(security)):
    clist = crud.update_cascade_list(session=session, id=id, payload=payload)
    return clist.serialize
