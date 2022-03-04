from fastapi import HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from models.question_group import QuestionGroupPayload, QuestionGroupDict
from models.question_group import QuestionGroup, QuestionGroupBase


def add_question_group(session: Session,
                       payload: QuestionGroupPayload) -> QuestionGroupDict:
    question_group = QuestionGroup(id=None,
                                   name=payload['name'],
                                   form=payload['form'],
                                   translations=payload['translations'],
                                   repeat=payload['repeat'])
    session.add(question_group)
    session.commit()
    session.flush()
    session.refresh(question_group)
    return question_group


def get_question_group(session: Session) -> List[QuestionGroupDict]:
    return session.query(QuestionGroup).all()


def get_question_group_by_id(session: Session, id: int) -> QuestionGroupBase:
    question_group = session.query(
        QuestionGroup).filter(QuestionGroup.id == id).first()
    if question_group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"question group {id} not found")
    return question_group


def update_question_group(session: Session, id: int,
                          payload: QuestionGroupPayload) -> QuestionGroupDict:
    question_group = get_question_group_by_id(session=session, id=id)
    question_group.form = payload['form']
    question_group.name = payload['name']
    question_group.translations = payload['translations']
    question_group.repeat = payload['repeat']
    session.commit()
    session.flush()
    session.refresh(question_group)
    return question_group


def delete_question_group(session: Session, id: int):
    question_group = get_question_group_by_id(session=session, id=id)
    session.delete(question_group)
    session.commit()
    session.flush()
