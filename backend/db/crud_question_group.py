from fastapi import HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from models.question_group import QuestionGroupPayload, QuestionGroupDict
from models.question_group import QuestionGroup, QuestionGroupBase
from models.question_group_member_access import QuestionGroupMemberAccess
from models.question_group_isco_access import QuestionGroupIscoAccess
from db.crud_question import add_question


def add_question_group(session: Session,
                       payload: QuestionGroupPayload) -> QuestionGroupBase:
    last_question_group = session.query(QuestionGroup).filter(
        QuestionGroup.form == payload['form']).order_by(
            QuestionGroup.order.desc()).first()
    if last_question_group:
        last_question_group = last_question_group.order + 1
    else:
        last_question_group = 1

    if "order" in payload:
        order = payload['order']
        if order:
            last_question_group = order

    question_group = QuestionGroup(id=None,
                                   name=payload['name'],
                                   description=payload['description'],
                                   form=payload['form'],
                                   order=last_question_group,
                                   translations=payload['translations'],
                                   repeat=payload['repeat'])
    if len(payload['member_access']):
        for ma in payload['member_access']:
            member = QuestionGroupMemberAccess(
                id=None,
                question_group=ma['question_group'],
                member_type=ma['member_type'])
            question_group.member_access.append(member)
    if len(payload['isco_access']):
        for ia in payload['isco_access']:
            isco = QuestionGroupIscoAccess(
                id=None,
                question_group=ia['question_group'],
                isco_type=ia['isco_type'])
            question_group.isco_access.append(isco)

    session.add(question_group)
    session.commit()
    session.flush()
    session.refresh(question_group)

    if len(payload['question']):
        for q in payload['question']:
            q['form'] = question_group.form,
            q['question_group'] = question_group.id
            add_question(session=session, payload=q)

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
                          payload: QuestionGroupPayload) -> QuestionGroupBase:
    question_group = get_question_group_by_id(session=session, id=id)
    question_group.form = payload['form']
    question_group.name = payload['name']
    question_group.description = payload['description']
    question_group.order = payload['order']
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
