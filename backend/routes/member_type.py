from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_member_type as crud
from db.connection import get_session
from models.member_type import MemberTypeBase
from models.member_type import MemberTypeDict, MemberTypePayload
from middleware import verify_super_admin

security = HTTPBearer()
member_type_route = APIRouter()


@member_type_route.post("/member_type",
                        response_model=MemberTypeDict,
                        summary="add new member type",
                        name="member_type:create",
                        tags=["Member Type"])
def add(req: Request, payload: MemberTypePayload,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    member_type = crud.add_member_type(session=session, payload=payload)
    return member_type.serialize


@member_type_route.get("/member_type/",
                       response_model=List[MemberTypeDict],
                       summary="get all member types",
                       name="member_type:get_all",
                       tags=["Member Type"])
def get(req: Request, session: Session = Depends(get_session)):
    member_type = crud.get_member_type(session=session)
    return [mt.serialize for mt in member_type]


@member_type_route.get("/member_type/{id:path}",
                       response_model=MemberTypeBase,
                       summary="get member type by id",
                       name="member_type:get_by_id",
                       tags=["Member Type"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    member_type = crud.get_member_type_by_id(session=session, id=id)
    return member_type.serialize


@member_type_route.put("/member_type/{id:path}",
                       response_model=MemberTypeDict,
                       summary="update member type",
                       name="member_type:put",
                       tags=["Member Type"])
def update(req: Request, id: int, payload: MemberTypePayload,
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    member_type = crud.update_member_type(session=session,
                                          id=id,
                                          payload=payload)
    return member_type.serialize


@member_type_route.delete("/member_type/{id:path}",
                          responses={204: {"model": None}},
                          status_code=HTTPStatus.NO_CONTENT,
                          summary="delete member type by id",
                          name="member_type:delete",
                          tags=["Member Type"])
def delete(req: Request, id: int, session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    crud.delete_member_type(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
