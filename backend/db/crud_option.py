from fastapi import HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from models.option import Option, OptionBase
from models.option import OptionDict, OptionPayload
import db.crud_skip_logic as crud_skip_logic
from models.question import QuestionType


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
    # check if option used in skip logic
    skip = crud_skip_logic.get_skip_logic_by_dependent(
        session=session, question=[option.question], check_option=True)
    if skip:
        skip_values = [sk.serialize for sk in skip]
        values = []
        for sv in skip_values:
            toption = sv['type'].value == QuestionType.option.value
            tmultiple = sv['type'].value == QuestionType.multiple_option.value
            if toption or tmultiple:
                temp = sv['value'].split("|")
                for t in temp:
                    values.append(int(t))
        if id in values:
            raise HTTPException(
                status_code=422,
                detail="This option used as a dependency for other question")
    session.delete(option)
    session.commit()
    session.flush()


def get_option_by_ids(session: Session, ids: List[int]) -> OptionDict:
    option = session.query(Option).filter(
        Option.id.in_(ids)).all()
    return option


def delete_option_by_question(session: Session, question: int):
    option = session.query(Option).filter(
        Option.question == question)
    option.delete()
    session.commit()
    session.flush()
    return option


def delete_option_by_question_ids(session: Session, question: List[int]):
    option = session.query(Option).filter(
        Option.question.in_(question))
    option.delete(False)
    session.commit()
    session.flush()
    return option
