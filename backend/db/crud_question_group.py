from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.question_group import QuestionGroupPayload, QuestionGroupDict
from models.question_group import QuestionGroup, QuestionGroupBase
from models.question_group_member_access import QuestionGroupMemberAccess
from models.question_group_isco_access import QuestionGroupIscoAccess
from models.question import Question
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
                                   repeat=payload['repeat'],
                                   repeat_text=payload['repeat_text'])
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
    question_group.repeat_text = payload['repeat_text']
    # Add member access
    if payload['member_access']:
        delete_member_access_by_group_id(session=session,
                                         question_group=[id])
        for ma in payload['member_access']:
            member = QuestionGroupMemberAccess(
                id=None,
                question_group=None,
                member_type=ma)
            question_group.member_access.append(member)
    # Add isco access
    if payload['isco_access']:
        delete_isco_access_by_group_id(session=session,
                                       question_group=[id])
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


def move_question_group(session: Session, id: int, selected_order: int,
                        target_order: int, target_id: int):
    group = session.query(QuestionGroup).filter(
        QuestionGroup.id == id).first()
    groups = session.query(QuestionGroup)

    if (selected_order > target_order):
        group.order = target_order
        groups = groups.filter(
            and_(QuestionGroup.form == group.form,
                 QuestionGroup.order >= target_order,
                 QuestionGroup.order != selected_order,
                 QuestionGroup.order < selected_order,
                 QuestionGroup.id != id))
        # update question between group
        between_group = session.query(
            QuestionGroup
        ).filter(and_(
            QuestionGroup.order <= selected_order,
            QuestionGroup.order >= target_order
        )).all()
        between_group_ids = [bg.id for bg in between_group]
        between_question = session.query(
            Question
        ).filter(
            Question.question_group.in_(between_group_ids)
        ).all()
        # selected question
        selected_q = session.query(Question).filter(
            Question.question_group == id).order_by(
                Question.order).all()
        selected_q_length = len(selected_q)
        for bq in between_question:
            bq.order = bq.order + selected_q_length
        # update question inside selected/moved group
        prev_order = session.query(
            Question).filter(
                Question.question_group == target_id
            ).order_by(
                Question.order.desc()).first().order
        for index, sq in enumerate(selected_q):
            if target_order <= 1:
                sq.order = index + 1
            else:
                sq.order = index + prev_order + 1

    if (selected_order < target_order):
        group.order = target_order - 1
        groups = groups.filter(
            and_(QuestionGroup.form == group.form,
                 QuestionGroup.order > selected_order,
                 QuestionGroup.order < target_order,
                 QuestionGroup.order != selected_order,
                 QuestionGroup.id != id))
        # update question between group
        between_group = session.query(
            QuestionGroup
        ).filter(and_(
            QuestionGroup.order < target_order,
            QuestionGroup.order >= selected_order
        )).all()
        between_group_ids = [bg.id for bg in between_group]
        between_question = session.query(
            Question
        ).filter(
            Question.question_group.in_(between_group_ids)
        ).all()
        # selected question
        selected_q = session.query(Question).filter(
                Question.question_group == id).order_by(
                    Question.order).all()
        selected_q_length = len(selected_q)
        for bq in between_question:
            bq.order = bq.order - selected_q_length
        # update question inside selected/moved group
        moved_group = session.query(
            QuestionGroup
        ).filter(and_(
            QuestionGroup.order >= selected_order,
            QuestionGroup.order < target_order
        )).all()
        moved_group_ids = [mg.id for mg in moved_group]
        moved_q = session.query(Question).filter(
            Question.question_group.in_(moved_group_ids)).all()
        moved_q_length = len(moved_q)
        for q in selected_q:
            q.order = q.order + moved_q_length

    groups = groups.order_by(QuestionGroup.order).all()
    for qg in groups:
        if (selected_order > target_order):
            qg.order = qg.order + 1
        if (selected_order < target_order):
            qg.order = qg.order - 1
    session.commit()
    session.flush()


def get_member_access_by_question_group_id(session: Session,
                                           question_group: List[int]) -> List:
    member_access = session.query(
        QuestionGroupMemberAccess).filter(
            QuestionGroupMemberAccess.question_group.in_(question_group))
    return member_access


def delete_member_access_by_group_id(session: Session,
                                     question_group: List[int]):
    # check if exist
    member_access = get_member_access_by_question_group_id(
        session=session, question_group=question_group)
    if member_access:
        # delete
        member_access.delete(False)
        session.commit()
        session.flush()
    return member_access


def get_isco_access_by_question_group_id(session: Session,
                                         question_group: List[int]) -> List:
    isco_access = session.query(
        QuestionGroupIscoAccess).filter(
            QuestionGroupIscoAccess.question_group.in_(question_group))
    return isco_access


def delete_isco_access_by_group_id(session: Session,
                                   question_group: List[int]):
    # check if exist
    isco_access = get_isco_access_by_question_group_id(
        session=session, question_group=question_group)
    if isco_access:
        # delete
        isco_access.delete(False)
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
    delete_question_by_group(session=session, group=[id])
    delete_member_access_by_group_id(session=session, question_group=[id])
    delete_isco_access_by_group_id(session=session, question_group=[id])
    question_group = get_question_group_by_id(session=session, id=id)
    form_id = question_group.form
    session.delete(question_group)
    reorder_question(session=session, form=form_id, question_group=id)
    reorder_question_group(session=session, form=form_id, exclude=id)
    session.commit()
    session.flush()
