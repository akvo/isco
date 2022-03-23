from fastapi import HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from models.option import Option, OptionBase
from models.option import OptionDict, OptionPayload


def add_option(session: Session, payload: OptionPayload):
    option = Option(id=None,
                    code=payload['code'],
                    name=payload['name'],
                    question=payload['question'],
                    order=payload['order'],
                    translations=payload['translations'])
    session.add(option)
    session.commit()
    session.flush()
    session.refresh(option)
    return option


def get_option(session: Session) -> List[OptionDict]:
    return session.query(Option).all()


def get_option_by_id(session: Session, id: int) -> OptionBase:
    option = session.query(Option).filter(Option.id == id).first()
    if option is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"option {id} not found")
    return option


def update_option(session: Session,
                  id: int, payload: OptionPayload) -> OptionDict:
    option = get_option_by_id(session=session, id=id)
    option.code = payload['code']
    option.name = payload['name']
    option.order = payload['order']
    option.translations = payload['translations']
    session.commit()
    session.flush()
    session.refresh(option)
    return option


def delete_option(session: Session, id: int):
    option = get_option_by_id(session=session, id=id)
    session.delete(option)
    session.commit()
    session.flush()


def get_option_by_ids(session: Session, ids: List[int]) -> OptionDict:
    option = session.query(Option).filter(
        Option.id.in_(ids)).all()
    return option
