from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy import and_
from sqlalchemy.orm import Session
from models.question import Question, QuestionBase
from models.question import QuestionDict, QuestionPayload
from models.option import Option
from models.question_member_access import QuestionMemberAccess
from models.question_isco_access import QuestionIscoAccess
from models.skip_logic import SkipLogic
from db.crud_option import delete_option_by_question_ids
from db.crud_skip_logic import delete_skip_logic_by_question


def add_question(session: Session, payload: QuestionPayload,
                 member_access: Optional[List[int]] = None,
                 isco_access: Optional[List[int]] = None) -> QuestionDict:
    question = Question(id=None,
                        form=payload['form'],
                        question_group=payload['question_group'],
                        name=payload['name'],
                        translations=payload['translations'],
                        mandatory=payload['mandatory'],
                        datapoint_name=payload['datapoint_name'],
                        variable_name=payload['variable_name'],
                        type=payload['type'],
                        personal_data=payload['personal_data'],
                        rule=payload['rule'],
                        tooltip=payload['tooltip'],
                        tooltip_translations=payload['tooltip_translations'],
                        cascade=payload['cascade'],
                        repeating_objects=payload['repeating_objects'],
                        order=payload['order'])
    if payload['option']:
        for o in payload['option']:
            opt = Option(id=None,
                         code=o['code'],
                         name=o['name'],
                         question=o['question'],
                         order=o['order'],
                         translations=o['translations'])
            question.option.append(opt)

    member_access_payload = None
    if payload['member_access']:
        member_access_payload = payload['member_access']
    if member_access:
        member_access_payload = member_access
    if member_access_payload:
        for ma in member_access_payload:
            member = QuestionMemberAccess(id=None,
                                          question=None,
                                          member_type=ma)
            question.member_access.append(member)

    isco_access_payload = None
    if payload['isco_access']:
        isco_access_payload = payload['isco_access']
    if isco_access:
        isco_access_payload = isco_access
    if isco_access_payload:
        for ia in isco_access_payload:
            isco = QuestionIscoAccess(id=None,
                                      question=None,
                                      isco_type=ia)
            question.isco_access.append(isco)

    if payload['skip_logic']:
        for sl in payload['skip_logic']:
            skip = SkipLogic(id=None,
                             question=sl['question'],
                             dependent_to=sl['dependent_to'],
                             operator=sl['operator'],
                             value=sl['value'],
                             type=sl['type'])
            question.skip_logic.append(skip)

    session.add(question)
    session.commit()
    session.flush()
    session.refresh(question)
    return question


def get_question(session: Session,
                 form: Optional[int] = None) -> List[QuestionDict]:
    if form:
        return session.query(
            Question).filter(Question.form == form).all()
    return session.query(Question).all()


def get_question_by_id(session: Session, id: int) -> QuestionBase:
    question = session.query(Question).filter(Question.id == id).first()
    if question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"question {id} not found")
    return question


def update_question(session: Session, id: int,
                    payload: QuestionPayload) -> QuestionDict:
    question = get_question_by_id(session=session, id=id)
    question.form = payload['form']
    question.question_group = payload['question_group']
    question.name = payload['name']
    question.translations = payload['translations']
    question.mandatory = payload['mandatory']
    question.datapoint_name = payload['datapoint_name']
    question.variable_name = payload['variable_name']
    question.type = payload['type']
    question.personal_data = payload['personal_data']
    question.rule = payload['rule']
    question.tooltip = payload['tooltip']
    question.tooltip_translations = payload['tooltip_translations']
    question.cascade = payload['cascade']
    question.repeating_objects = payload['repeating_objects']
    question.order = payload['order']
    # Add member access
    if payload['member_access']:
        delete_member_access_by_question_id(
            session=session, question=[id])
        for ma in payload['member_access']:
            member = QuestionMemberAccess(
                id=None,
                question=None,
                member_type=ma)
            question.member_access.append(member)
    # Add isco access
    if payload['isco_access']:
        delete_isco_access_by_question_id(
            session=session, question=[id])
        for ia in payload['isco_access']:
            isco = QuestionIscoAccess(
                id=None,
                question=None,
                isco_type=ia)
            question.isco_access.append(isco)
    session.commit()
    session.flush()
    session.refresh(question)
    return question


def move_question(session: Session, id: int, selected_order: int,
                  target_order: int, target_group: int):
    question = session.query(Question).filter(
        Question.id == id).first()
    # update question group id
    question.question_group = target_group
    questions = session.query(Question)
    # update order
    if (selected_order > target_order):
        question.order = target_order
        questions = questions.filter(
            and_(Question.form == question.form,
                 Question.order >= target_order,
                 Question.order != selected_order,
                 Question.order < selected_order,
                 Question.id != id))
    if (selected_order < target_order):
        question.order = target_order - 1
        questions = questions.filter(
            and_(Question.form == question.form,
                 Question.order > selected_order,
                 Question.order < target_order,
                 Question.order != selected_order,
                 Question.id != id))
    questions = questions.order_by(Question.order).all()
    for q in questions:
        if (selected_order > target_order):
            q.order = q.order + 1
        if (selected_order < target_order):
            q.order = q.order - 1
    session.commit()
    session.flush()


def get_member_access_by_question_id(session: Session,
                                     question: int) -> List:
    member_access = session.query(
        QuestionMemberAccess).filter(
            QuestionMemberAccess.question.in_(question))
    return member_access


def delete_member_access_by_question_id(session: Session, question: List[int]):
    # check if exist
    member_access = get_member_access_by_question_id(
        session=session, question=question)
    if member_access:
        # delete
        member_access.delete(False)
        session.commit()
        session.flush()
    return member_access


def get_isco_access_by_question_id(session: Session,
                                   question: List[int]) -> List:
    isco_access = session.query(
        QuestionIscoAccess).filter(
            QuestionIscoAccess.question.in_(question))
    return isco_access


def delete_isco_access_by_question_id(session: Session, question: List[int]):
    # check if exist
    isco_access = get_isco_access_by_question_id(
        session=session, question=question)
    if isco_access:
        # delete
        isco_access.delete(False)
        session.commit()
        session.flush()
    return isco_access


def get_question_by_group(session: Session, group: int):
    question = session.query(Question).filter(
        Question.question_group.in_(group))
    return question


def delete_question_by_group(session: Session, group: List[int]):
    # check if exist
    question = get_question_by_group(session=session, group=group)
    if question:
        question_ids = [q.id for q in question.all()]
        delete_member_access_by_question_id(
                session=session, question=question_ids)
        delete_isco_access_by_question_id(
            session=session, question=question_ids)
        delete_option_by_question_ids(
            session=session, question=question_ids)
        delete_skip_logic_by_question(
            session=session, question=question_ids)
        question.delete()
        session.commit()
        session.flush()
    return question


def reorder_question(session: Session, form: int,
                     exclude: Optional[int] = None,
                     question_group: Optional[int] = None,
                     only: Optional[List[int]] = None,
                     order: Optional[int] = 1):
    if not exclude and not question_group and not only:
        return False
    questions = session.query(Question).filter(
        Question.form == form)
    if exclude:
        questions = questions.filter(Question.id != exclude)
    if question_group:
        questions = questions.filter(Question.question_group != question_group)
    if only:
        questions = questions.filter(Question.id.in_(only))
    questions = questions.order_by(Question.order).all()
    for index, q in enumerate(questions):
        q.order = index + order
    return questions


def delete_question(session: Session, id: int):
    delete_member_access_by_question_id(session=session, question=[id])
    delete_isco_access_by_question_id(session=session, question=[id])
    delete_option_by_question_ids(session=session, question=[id])
    delete_skip_logic_by_question(session=session, question=[id])
    question = get_question_by_id(session=session, id=id)
    form_id = question.form
    session.delete(question)
    reorder_question(session=session, form=form_id, exclude=id)
    session.commit()
    session.flush()
