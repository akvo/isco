from fastapi import HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from models.isco_type import IscoType, IscoTypeBase
from models.isco_type import IscoTypeDict, IscoTypePayload


def add_isco_type(session: Session, payload: IscoTypePayload):
    isco_type = IscoType(id=None, name=payload['name'])
    session.add(isco_type)
    session.commit()
    session.flush()
    session.refresh(isco_type)
    return isco_type


def get_isco_type(session: Session) -> List[IscoTypeDict]:
    return session.query(IscoType).all()


def get_isco_type_by_id(session: Session, id: int) -> IscoTypeBase:
    isco_type = session.query(IscoType).filter(IscoType.id == id).first()
    if isco_type is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"isco_type {id} not found")
    return isco_type


def get_isco_type_by_name(session: Session, name: str):
    member_type = session.query(
        IscoType).filter(IscoType.name == name).first()
    return member_type


def update_isco_type(session: Session, id: int,
                     payload: IscoTypePayload) -> IscoTypeDict:
    isco_type = get_isco_type_by_id(session=session, id=id)
    isco_type.name = payload['name']
    session.commit()
    session.flush()
    session.refresh(isco_type)
    return isco_type


def delete_isco_type(session: Session, id: int):
    isco_type = get_isco_type_by_id(session=session, id=id)
    session.delete(isco_type)
    session.commit()
    session.flush()
