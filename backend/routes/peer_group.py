from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_peer_group as crud
from db.connection import get_session
from models.peer_group import (
    PeerGroupWithMappingsDict,
    UpdatePeerGroupMappingsPayload,
)
from middleware import verify_super_admin

security = HTTPBearer()
peer_group_route = APIRouter()


@peer_group_route.get(
    "/peer_group/",
    response_model=List[PeerGroupWithMappingsDict],
    summary="get all peer groups with mapped member types",
    name="peer_group:get_all",
    tags=["Peer Group"],
)
def get_all(
    req: Request,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    return crud.get_peer_groups_with_mappings(session=session)


@peer_group_route.get(
    "/peer_group/{id:path}",
    response_model=PeerGroupWithMappingsDict,
    summary="get peer group by id with mapped member types",
    name="peer_group:get_by_id",
    tags=["Peer Group"],
)
def get_by_id(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    peer_group = crud.get_peer_group_by_id(session=session, id=id)
    return peer_group.serialize_with_mappings


@peer_group_route.put(
    "/peer_group/{id:path}/mappings",
    response_model=PeerGroupWithMappingsDict,
    summary="update member types mapped to a peer group",
    name="peer_group:update_mappings",
    tags=["Peer Group"],
)
def update_mappings(
    req: Request,
    id: int,
    payload: UpdatePeerGroupMappingsPayload,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    return crud.sync_peer_group_member_types(
        session=session,
        peer_group_id=id,
        member_type_ids=payload.member_type_ids,
    )
