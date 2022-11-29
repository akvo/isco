from datetime import datetime
from fastapi import HTTPException, status
from typing import List, Union, Optional
from typing_extensions import TypedDict
from sqlalchemy import desc
from sqlalchemy.orm import Session
from models.roadmap_question_group import RoadmapQuestionGroupDict
from models.roadmap_question_group import RoadmapQuestionGroup
from models.roadmap_data import RoadmapData, RoadmapDataDict
from models.roadmap_answer import RoadmapAnswer, RoadmapAnswerPayload
from models.roadmap_answer import RoadmapAnswerDict
from models.roadmap_question import RoadmapQuestion
from models.roadmap_question import RoadmapQuestionType
from models.roadmap_question import RoadmapQuestionTypeDict


class PaginatedData(TypedDict):
    data: List[RoadmapDataDict]
    count: int


def append_value(
    answer: RoadmapAnswer,
    value: Union[
        int, float, str, bool, List[str],
        List[int], List[float], List[dict]],
    type: RoadmapQuestionType
) -> RoadmapAnswer:
    if type == RoadmapQuestionType.input.value:
        answer.text = value
    if type == RoadmapQuestionType.number.value:
        answer.value = value
    if type == RoadmapQuestionType.text.value:
        answer.text = value
    if type == RoadmapQuestionType.date.value:
        answer.text = value
    if type == RoadmapQuestionType.option.value:
        answer.options = [value]
    if type == RoadmapQuestionType.multiple_option.value:
        answer.options = value
    if type == RoadmapQuestionType.nested_list.value or type == "tree":
        answer.options = value
    if type == RoadmapQuestionType.cascade.value:
        answer.options = value
    if type == RoadmapQuestionType.table.value:
        answer.table = value
    return answer


def get_roadmap_question_group(
    session: Session
) -> List[RoadmapQuestionGroupDict]:
    qg = session.query(RoadmapQuestionGroup).all()
    if not len(qg):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap form not found")
    return qg


def add_roadmap_data(
    session: Session, data: RoadmapData, answers: List[RoadmapAnswerPayload]
) -> None:
    if len(answers):
        for a in answers:
            answer = RoadmapAnswer(
                question=a.get('question'),
                repeat_index=a.get('repeat_index'),
                created=datetime.now()
            )
            answer = append_value(
                answer=answer,
                value=a.get('value'),
                type=a.get('type')
            )
            data.answer.append(answer)
    session.add(data)
    session.commit()
    session.flush()
    session.refresh(data)


def update_roadmap_data(
    session: Session, data: RoadmapData
) -> RoadmapDataDict:
    data.updated = datetime.now()
    session.commit()
    session.flush()
    # session.refresh(data)
    return data


def get_questions_by_ids(
    session: Session, ids: List[int]
) -> List[RoadmapQuestionTypeDict]:
    return session.query(RoadmapQuestion).filter(
        RoadmapQuestion.id.in_(ids)).all()


def get_data(
    session: Session, skip: int, page_size: int,
    organisation_ids: Optional[List[int]] = None
) -> PaginatedData:
    data = session.query(RoadmapData)
    if organisation_ids:
        data = data.filter(
            RoadmapData.organisation.in_(organisation_ids))
    count = data.count()
    data = data.order_by(
        desc(RoadmapData.id)).offset(skip).limit(page_size).all()
    return PaginatedData(data=data, count=count)


def get_data_by_id(
    session: Session, id: Optional[int] = None,
    organisation_id: Optional[int] = None
) -> RoadmapDataDict:
    data = session.query(RoadmapData)
    if id:
        data = data.filter(RoadmapData.id == id)
    if organisation_id:
        data = data.filter(RoadmapData.organisation == organisation_id)
    data = data.first()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap datapoint not found")
    return data


def get_answer_by_data(
    session: Session, data_id: int
) -> RoadmapAnswerDict:
    answer = session.query(RoadmapAnswer).filter(
        RoadmapAnswer.data == data_id).all()
    if not len(answer):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap answer not found")
    return answer


def add_roadmap_answer(
    session: Session,
    answer: RoadmapAnswer,
    type: RoadmapQuestionType,
    value: Union[
        int, float, str, bool, List[str],
        List[int], List[float], List[dict]]
) -> RoadmapAnswerDict:
    answer = append_value(answer, value, type)
    session.add(answer)
    session.commit()
    session.flush()
    # session.refresh(answer)
    return answer


def update_roadmap_answer(
    session: Session,
    answer: RoadmapAnswer,
    type: RoadmapQuestionType,
    repeat_index: int,
    value: Union[
        int, float, str, bool, List[str],
        List[int], List[float], List[dict]]
) -> RoadmapAnswerDict:
    answer.updated = datetime.now()
    answer.repeat_index = repeat_index
    answer = append_value(answer, value, type)
    session.commit()
    session.flush()
    # session.refresh(answer)
    return answer


def delete_roadmap_answer_by_id(
    session: Session, id: int
) -> None:
    session.query(RoadmapAnswer).filter(RoadmapAnswer.id == id).delete()
    session.commit()


def delete_roadmap_data_by_id(
    session: Session, id: int
) -> None:
    session.query(RoadmapData).filter(RoadmapData.id == id).delete()
    session.commit()
