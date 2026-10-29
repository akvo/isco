from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from models.peer_group import (
    PeerGroup,
    PeerGroupDict,
    PeerGroupPayload,
    PeerGroupMemberType,
    PeerGroupMemberTypePayload,
)


def add_peer_group(session: Session, payload: PeerGroupPayload) -> PeerGroup:
    peer_group = PeerGroup(
        name=payload["name"],
        code=payload["code"],
        description=payload.get("description"),
    )
    session.add(peer_group)
    session.commit()
    session.flush()
    session.refresh(peer_group)
    return peer_group


def get_peer_groups(session: Session) -> List[PeerGroup]:
    return session.query(PeerGroup).order_by(PeerGroup.id).all()


def get_peer_group_by_id(session: Session, id: int) -> PeerGroup:
    peer_group = session.query(PeerGroup).filter(PeerGroup.id == id).first()
    if not peer_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Peer group {id} not found",
        )
    return peer_group


def get_peer_group_by_code(
    session: Session, code: str
) -> Optional[PeerGroup]:
    return session.query(PeerGroup).filter(PeerGroup.code == code).first()


def update_peer_group(
    session: Session, id: int, payload: PeerGroupPayload
) -> PeerGroupDict:
    peer_group = get_peer_group_by_id(session=session, id=id)
    peer_group.name = payload["name"]
    peer_group.code = payload["code"]
    if "description" in payload:
        peer_group.description = payload["description"]
    session.commit()
    session.flush()
    session.refresh(peer_group)
    return peer_group


def delete_peer_group(session: Session, id: int):
    peer_group = get_peer_group_by_id(session=session, id=id)
    session.delete(peer_group)
    session.commit()
    session.flush()


def add_peer_group_member_type(
    session: Session, payload: PeerGroupMemberTypePayload
) -> PeerGroupMemberType:
    mapping = PeerGroupMemberType(
        peer_group_id=payload["peer_group_id"],
        member_type_id=payload["member_type_id"],
        isco_scope=payload.get("isco_scope", "ALL"),
    )
    session.add(mapping)
    session.commit()
    session.flush()
    session.refresh(mapping)
    return mapping


def get_peer_group_for_member_type(
    session: Session, member_type_id: int
) -> Optional[PeerGroup]:
    mapping = (
        session.query(PeerGroupMemberType)
        .filter(PeerGroupMemberType.member_type_id == member_type_id)
        .first()
    )
    if mapping and mapping.peer_group_detail:
        return mapping.peer_group_detail
    return None
