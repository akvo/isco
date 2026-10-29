from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from models.member_type import MemberType
from models.peer_group import (
    PeerGroup,
    PeerGroupDict,
    PeerGroupPayload,
    PeerGroupMemberType,
    PeerGroupMemberTypePayload,
    PeerGroupWithMappingsDict,
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


def get_peer_groups_with_mappings(
    session: Session,
) -> List[PeerGroupWithMappingsDict]:
    groups = session.query(PeerGroup).order_by(PeerGroup.id).all()
    return [g.serialize_with_mappings for g in groups]


def sync_peer_group_member_types(
    session: Session, peer_group_id: int, member_type_ids: List[int]
) -> PeerGroupWithMappingsDict:
    peer_group = get_peer_group_by_id(session=session, id=peer_group_id)

    # Validate that all requested member_type_ids exist
    if member_type_ids:
        existing_mts = (
            session.query(MemberType.id)
            .filter(MemberType.id.in_(member_type_ids))
            .all()
        )
        existing_ids = {m[0] for m in existing_mts}
        invalid_ids = set(member_type_ids) - existing_ids
        if invalid_ids:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Member types not found: {sorted(list(invalid_ids))}",
            )

    # Current mappings for this peer group
    current_mappings = (
        session.query(PeerGroupMemberType)
        .filter(PeerGroupMemberType.peer_group_id == peer_group_id)
        .all()
    )
    current_mapped_ids = {m.member_type_id: m for m in current_mappings}

    # Remove unselected mappings
    for mt_id, mapping_obj in current_mapped_ids.items():
        if mt_id not in member_type_ids:
            session.delete(mapping_obj)

    # Add new mappings
    for mt_id in member_type_ids:
        if mt_id not in current_mapped_ids:
            new_map = PeerGroupMemberType(
                peer_group_id=peer_group_id,
                member_type_id=mt_id,
                isco_scope="ALL",
            )
            session.add(new_map)

    session.commit()
    session.flush()
    session.refresh(peer_group)
    return peer_group.serialize_with_mappings


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
