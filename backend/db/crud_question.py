from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from models.question import Question, QuestionBase
from models.question import QuestionDict, QuestionPayload


def add_question(session: Session, payload: QuestionPayload) -> QuestionDict:
    question = Question(id=None,
                        form=payload['form'],
                        question_group=payload['question_group'],
                        name=payload['name'],
                        translations=payload['translations'],
                        mandatory=payload['mandatory'],
                        datapoint_name=payload['datapoint_name'],
                        variable_name=payload['variable_name'],
                        type=payload['type'],
                        member_type=payload['member_type'],
                        isco_type=payload['isco_type'],
                        personal_data=payload['personal_data'],
                        rule=payload['rule'],
                        tooltip=payload['tooltip'],
                        tooltip_translations=payload['tooltip_translations'],
                        cascade=payload['cascade'],
                        repeating_objects=payload['repeating_objects'])
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
    question.member_type = payload['member_type']
    question.isco_type = payload['isco_type']
    question.personal_data = payload['personal_data']
    question.rule = payload['rule']
    question.tooltip = payload['tooltip']
    question.tooltip_translations = payload['tooltip_translations']
    question.cascade = payload['cascade']
    question.repeating_objects = payload['repeating_objects']
    session.commit()
    session.flush()
    session.refresh(question)
    return question


def delete_question(session: Session, id: int):
    question = get_question_by_id(session=session, id=id)
    session.delete(question)
    session.commit()
    session.flush()
