from datetime import datetime
from typing import List, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.answer import Answer, AnswerDict, AnswerBase
from models.question import QuestionType


def append_value(answer: Answer, value: Union[int, float, str, bool, List[str],
                                              List[int], List[float]],
                 type: QuestionType) -> Answer:
    if type == QuestionType.input.value:
        answer.text = value
    if type == QuestionType.number.value:
        answer.value = value
    if type == QuestionType.text.value:
        answer.text = value
    if type == QuestionType.date.value:
        answer.text = value
    if type == QuestionType.option.value:
        answer.options = [value]
    if type == QuestionType.multiple_option.value:
        answer.options = value
    if type == QuestionType.nested_list.value or type == "tree":
        answer.options = value
    if type == QuestionType.cascade.value:
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
    # session.refresh(answer)
    return answer


def update_answer(
    session: Session, answer: Answer, type: QuestionType,
    repeat_index: int,
    comment: str,
    value: Union[int, float, str, bool, List[str],
                 List[int], List[float]]
) -> AnswerDict:
    answer.updated = datetime.now()
    answer.repeat_index = repeat_index
    answer.comment = comment
    answer = append_value(answer, value, type)
    session.commit()
    session.flush()
    # session.refresh(answer)
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


def delete_answer_by_id(session: Session, id: int) -> None:
    session.query(Answer).filter(Answer.id == id).delete()
    session.commit()


def delete_answer_by_data_id(session: Session, data_id: int) -> None:
    session.query(Answer).filter(Answer.data == data_id).delete()
    session.commit()
