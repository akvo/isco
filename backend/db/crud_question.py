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


def add_question(session: Session, payload: QuestionPayload) -> QuestionDict:
    last_question = session.query(Question).filter(
        and_(Question.form == payload['form'],
             Question.question_group == payload['question_group'])).order_by(
                 Question.order.desc()).first()
    if last_question:
        last_question = last_question.order + 1
    else:
        last_question = 1

    if "order" in payload:
        order = payload['order']
        if order:
            last_question = order

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
                        order=last_question)
    if len(payload['option']):
        for o in payload['option']:
            opt = Option(id=None,
                         code=o['code'],
                         name=o['name'],
                         question=o['question'],
                         order=o['order'],
                         translations=o['translations'])
            question.option.append(opt)
    if len(payload['member_access']):
        for ma in payload['member_access']:
            member = QuestionMemberAccess(id=None,
                                          question=ma['question'],
                                          member_type=ma['member_type'])
            question.member_access.append(member)
    if len(payload['isco_access']):
        for ia in payload['isco_access']:
            isco = QuestionIscoAccess(id=None,
                                      question=ia['question'],
                                      isco_type=ia['isco_type'])
            question.isco_access.append(isco)
    if len(payload['skip_logic']):
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
    session.commit()
    session.flush()
    session.refresh(question)
    return question


def delete_question(session: Session, id: int):
    question = get_question_by_id(session=session, id=id)
    session.delete(question)
    session.commit()
    session.flush()
