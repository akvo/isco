from fastapi import HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from models.member_type import MemberType, MemberTypeBase
from models.member_type import MemberTypeDict, MemberTypePayload


def add_member_type(session: Session, payload: MemberTypePayload):
    member_type = MemberType(id=None, name=payload['name'])
    session.add(member_type)
    session.commit()
    session.flush()
    session.refresh(member_type)
    return member_type


def get_member_type(session: Session) -> List[MemberTypeDict]:
    return session.query(MemberType).all()


def get_member_type_by_id(session: Session, id: int) -> MemberTypeBase:
    member_type = session.query(MemberType).filter(MemberType.id == id).first()
    if member_type is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"member_type {id} not found")
    return member_type


def update_member_type(session: Session, id: int,
                       payload: MemberTypePayload) -> MemberTypeDict:
    member_type = get_member_type_by_id(session=session, id=id)
    member_type.name = payload['name']
    session.commit()
    session.flush()
    session.refresh(member_type)
    return member_type


def delete_member_type(session: Session, id: int):
    member_type = get_member_type_by_id(session=session, id=id)
    session.delete(member_type)
    session.commit()
    session.flush()
