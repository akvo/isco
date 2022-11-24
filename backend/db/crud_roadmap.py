from fastapi import HTTPException, status
from typing import List, Union
from sqlalchemy.orm import Session
from models.roadmap_question_group import RoadmapQuestionGroupDict
from models.roadmap_question_group import RoadmapQuestionGroup
from models.roadmap_data import RoadmapData
from models.roadmap_answer import RoadmapAnswer
from models.roadmap_question import RoadmapQuestionType


def append_value(
    answer: RoadmapAnswer,
    value: Union[int, float, str, bool, List[str], List[int], List[float]],
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
            detail="Roadmapp form not found")
    return qg


def add_roadmap_data(
    session: Session, data: RoadmapData, answers: List[dict]
) -> None:
    if len(answers):
        data.answer.append(answers)
    session.add(data)
    session.commit()
    session.flush()
    session.refresh(data)
