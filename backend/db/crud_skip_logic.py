from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from models.skip_logic import SkipLogic, SkipLogicBase
from models.skip_logic import SkipLogicDict, SkipLogicPayload


def add_skip_logic(session: Session, payload: SkipLogicPayload):
    # check if there's skip logic before, and delete that
    # remove this when maybe 1 question have more than 1 skip logic
    skip_logic = session.query(SkipLogic).filter(
        SkipLogic.question == payload['question'])
    skip_logic.delete()
    ##
    # then post new skip logic
    skip_logic = SkipLogic(id=None,
                           question=payload['question'],
                           dependent_to=payload['dependent_to'],
                           operator=payload['operator'],
                           value=payload['value'],
                           type=payload['type'])
    session.add(skip_logic)
    session.commit()
    session.flush()
    session.refresh(skip_logic)
    return skip_logic


def get_skip_logic(session: Session) -> List[SkipLogicDict]:
    return session.query(SkipLogic).all()


def get_skip_logic_by_id(session: Session, id: int) -> SkipLogicBase:
    skip_logic = session.query(SkipLogic).filter(SkipLogic.id == id).first()
    if skip_logic is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"skip logic {id} not found")
    return skip_logic


def update_skip_logic(session: Session, id: int,
                      payload: SkipLogicPayload) -> SkipLogicDict:
    skip_logic = get_skip_logic_by_id(session=session, id=id)
    skip_logic.question = payload['question']
    skip_logic.dependent_to = payload['dependent_to']
    skip_logic.operator = payload['operator']
    skip_logic.value = payload['value']
    skip_logic.type = payload['type']
    session.commit()
    session.flush()
    session.refresh(skip_logic)
    return skip_logic


def delete_skip_logic(session: Session, id: int):
    skip_logic = get_skip_logic_by_id(session=session, id=id)
    session.delete(skip_logic)
    session.commit()
    session.flush()


def get_skip_logic_by_dependent(session: Session,
                                question: List[int],
                                check_option: bool = False):
    skip_logic = session.query(SkipLogic).filter(
        SkipLogic.dependent_to.in_(question)).all()
    if skip_logic and not check_option:
        raise HTTPException(
            status_code=422,
            detail="This question used as a dependency for other question")
    return skip_logic


def delete_skip_logic_by_question(session: Session, question: List[int],
                                  dependency: Optional[bool] = True):
    if dependency:
        get_skip_logic_by_dependent(session=session, question=question)
    skip_logic = session.query(SkipLogic).filter(
        SkipLogic.question.in_(question))
    skip_logic.delete(False)
    session.commit()
    session.flush()
    return skip_logic
