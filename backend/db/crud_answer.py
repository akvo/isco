from datetime import datetime
from typing import List, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.answer import Answer, AnswerDict, AnswerBase
from models.question import QuestionType


def append_value(answer: Answer, value: Union[int, float, str, bool, List[str],
                                              List[int], List[float]],
                 type: QuestionType) -> Answer:
    if type == QuestionType.input:
        answer.text = value
    if type == QuestionType.number:
        answer.value = value
    if type == QuestionType.text:
        answer.text = value
    if type == QuestionType.date:
        answer.text = value
    if type == QuestionType.option:
        answer.options = value
    if type == QuestionType.multiple_option:
        answer.options = value
    if type == QuestionType.nested_list:
        answer.options = value
    if type == QuestionType.cascade:
        answer.options = value
    return answer


def add_answer(
    session: Session, answer: Answer, type: QuestionType,
    value: Union[int, float, str, bool, List[str], List[int], List[float]]
) -> AnswerDict:
    answer = append_value(answer, value, type)
    session.add(answer)
    session.commit()
    session.flush()
    session.refresh(answer)
    return answer


def update_answer(
    session: Session, answer: Answer, user: int,
    type: QuestionType, value: Union[int, float, str, bool, List[str],
                                     List[int], List[float]]
) -> AnswerDict:
    answer.updated = datetime.now()
    answer = append_value(answer, value, type)
    session.commit()
    session.flush()
    session.refresh(answer)
    return answer


def get_answer(session: Session) -> List[AnswerDict]:
    return session.query(Answer).all()


def get_answer_by_question(session: Session,
                           question: int) -> List[AnswerDict]:
    return session.query(Answer).filter(Answer.question == question).all()


def get_answer_by_data_and_question(session: Session, data: int,
                                    questions: List[int]) -> List[AnswerBase]:
    return session.query(Answer).filter(
        and_(Answer.question.in_(questions), Answer.data == data)).all()
