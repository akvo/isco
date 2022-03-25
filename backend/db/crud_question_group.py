from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from models.question_group import QuestionGroupPayload, QuestionGroupDict
from models.question_group import QuestionGroup, QuestionGroupBase
from models.question_group_member_access import QuestionGroupMemberAccess
from models.question_group_isco_access import QuestionGroupIscoAccess
from db.crud_question import add_question, delete_question_by_group
from db.crud_question import reorder_question


def add_question_group(session: Session,
                       payload: QuestionGroupPayload) -> QuestionGroupBase:
    question_group = QuestionGroup(id=None,
                                   name=payload['name'],
                                   description=payload['description'],
                                   form=payload['form'],
                                   order=payload['order'],
                                   translations=payload['translations'],
                                   repeat=payload['repeat'])
    if payload['member_access']:
        for ma in payload['member_access']:
            member = QuestionGroupMemberAccess(
                id=None,
                question_group=None,
                member_type=ma)
            question_group.member_access.append(member)

    if payload['isco_access']:
        for ia in payload['isco_access']:
            isco = QuestionGroupIscoAccess(
                id=None,
                question_group=None,
                isco_type=ia)
            question_group.isco_access.append(isco)

    session.add(question_group)
    session.commit()
    session.flush()
    session.refresh(question_group)

    if payload['question']:
        for q in payload['question']:
            q['form'] = question_group.form,
            q['question_group'] = question_group.id
            add_question(session=session,
                         payload=q,
                         member_access=payload['member_access'],
                         isco_access=payload['isco_access'])

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
    # Add member access
    if payload['member_access']:
        delete_member_access_by_group_id(session=session,
                                         question_group=id)
        for ma in payload['member_access']:
            member = QuestionGroupMemberAccess(
                id=None,
                question_group=None,
                member_type=ma)
            question_group.member_access.append(member)
    # Add isco access
    if payload['isco_access']:
        delete_isco_access_by_group_id(session=session,
                                       question_group=id)
        for ia in payload['isco_access']:
            isco = QuestionGroupIscoAccess(
                id=None,
                question_group=None,
                isco_type=ia)
            question_group.isco_access.append(isco)

    session.commit()
    session.flush()
    session.refresh(question_group)
    return question_group


def get_member_access_by_question_group_id(session: Session,
                                           question_group: int) -> List:
    member_access = session.query(
        QuestionGroupMemberAccess).filter(
            QuestionGroupMemberAccess.question_group == question_group)
    return member_access


def delete_member_access_by_group_id(session: Session, question_group: int):
    # check if exist
    member_access = get_member_access_by_question_group_id(
        session=session, question_group=question_group)
    if member_access:
        # delete
        member_access.delete()
        session.commit()
        session.flush()
    return member_access


def get_isco_access_by_question_group_id(session: Session,
                                         question_group: int) -> List:
    isco_access = session.query(
        QuestionGroupIscoAccess).filter(
            QuestionGroupIscoAccess.question_group == question_group)
    return isco_access


def delete_isco_access_by_group_id(session: Session, question_group: int):
    # check if exist
    isco_access = get_isco_access_by_question_group_id(
        session=session, question_group=question_group)
    if isco_access:
        # delete
        isco_access.delete()
        session.commit()
        session.flush()
    return isco_access


def reorder_question_group(session: Session, form: int,
                           exclude: Optional[int] = None,
                           only: Optional[List[int]] = None,
                           order: Optional[int] = 1):
    if not exclude and not only:
        return False
    groups = session.query(QuestionGroup).filter(QuestionGroup.form == form)
    if exclude:
        groups = groups.filter(QuestionGroup.id != exclude)
    if only:
        groups = groups.filter(QuestionGroup.id.in_(only))
    groups = groups.order_by(QuestionGroup.order).all()
    for index, qg in enumerate(groups):
        qg.order = index + order
    return groups


def delete_question_group(session: Session, id: int):
    # delete question
    delete_question_by_group(session=session, group=id)
    delete_member_access_by_group_id(session=session, question_group=id)
    delete_isco_access_by_group_id(session=session, question_group=id)
    question_group = get_question_group_by_id(session=session, id=id)
    form_id = question_group.form
    session.delete(question_group)
    reorder_question(session=session, form=form_id, question_group=id)
    reorder_question_group(session=session, form=form_id, exclude=id)
    session.commit()
    session.flush()
