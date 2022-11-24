# Please don't use **kwargs
# Keep the code clean and CLEAR

from datetime import datetime
from typing_extensions import TypedDict
from typing import Optional, List, Union
from pydantic import BaseModel
from models.roadmap_question import RoadmapQuestionType
from sqlalchemy import Column, Integer, Float, Text, String
from sqlalchemy import ForeignKey, DateTime, BigInteger
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base


class RoadmapAnswerPayload(TypedDict):
    question: int
    type: RoadmapQuestionType
    value: Union[
        float, int, str, bool, dict, List[float],
        List[int], List[str], None, List[dict]]


class RoadmapAnswerDict(TypedDict):
    id: int
    question: int
    repeat_index: Optional[int] = None
    value: Union[
        float, int, str, bool, dict, List[float],
        List[int], List[str], None, List[dict]]


class RoadmapAnswer(Base):
    __tablename__ = "roadmap_answer"
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        nullable=True,
        autoincrement=True
    )
    question = Column(
        BigInteger,
        ForeignKey(
            "roadmap_question.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    data = Column(
        Integer,
        ForeignKey(
            "roadmap_data.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    text = Column(Text, nullable=True)
    value = Column(Float, nullable=True)
    options = Column(pg.ARRAY(String), nullable=True)
    table = Column(pg.ARRAY(pg.JSONB), nullable=True)
    repeat_index = Column(Integer, nullable=True, default=0)
    created = Column(DateTime, nullable=True)
    updated = Column(DateTime, nullable=True)
    question_detail = relationship("RoadmapQuestion", backref="roadmap_answer")

    def __init__(
        self,
        question: int,
        created: datetime,
        data: Optional[int] = None,
        text: Optional[str] = None,
        value: Optional[float] = None,
        options: Optional[List[str]] = None,
        table: Optional[List[dict]] = None,
        repeat_index: Optional[int] = None,
        updated: Optional[datetime] = None,
    ):
        self.question = question
        self.data = data
        self.text = text
        self.value = value
        self.options = options
        self.table = table
        self.repeat_index = repeat_index
        self.updated = updated
        self.created = created

    def __repr__(self) -> int:
        return f"<RoadmapAnswer {self.id}>"

    @property
    def serialize(self) -> RoadmapAnswerDict:
        return {
            "id": self.id,
            "question": self.question,
            "data": self.data,
            "text": self.text,
            "value": self.value,
            "options": self.options,
            "table": self.table,
            "repeat_index": self.repeat_index,
            "created": self.created,
            "updated": self.updated,
        }

    @property
    def formatted(self) -> RoadmapAnswerDict:
        answer = {
            "question": self.question,
            "repeat_index": self.repeat_index,
        }
        q = self.question_detail
        type = q.type
        if type in [RoadmapQuestionType.input,
                    RoadmapQuestionType.text,
                    RoadmapQuestionType.date]:
            answer.update({"value": self.text})
        if type == RoadmapQuestionType.number:
            val = self.value
            if q.rule:
                if q.rule.get("allow_decimal"):
                    val = float(val) if val else None
            else:
                val = int(val) if val else None
            answer.update({"value": val})
        if type == RoadmapQuestionType.option:
            answer.update({"value": self.options[0]})
        if type in [RoadmapQuestionType.multiple_option,
                    RoadmapQuestionType.nested_list]:
            answer.update({"value": self.options})
        if type == RoadmapQuestionType.cascade:
            answer.update({"value": [int(float(o)) for o in self.options]})
        return answer

    @property
    def format_with_answer_id(self) -> RoadmapAnswerDict:
        answer = {
            "id": self.id,
            "question": self.question,
            "repeat_index": self.repeat_index,
        }
        q = self.question_detail
        type = q.type
        if type in [RoadmapQuestionType.input,
                    RoadmapQuestionType.text,
                    RoadmapQuestionType.date]:
            answer.update({"value": self.text})
        if type == RoadmapQuestionType.number:
            val = self.value
            if q.rule:
                if q.rule.get("allow_decimal"):
                    val = float(val) if val else None
            else:
                val = int(val) if val else None
            answer.update({"value": val})
        if type == RoadmapQuestionType.option:
            answer.update({"value": self.options[0]})
        if type in [RoadmapQuestionType.multiple_option,
                    RoadmapQuestionType.nested_list]:
            answer.update({"value": self.options})
        if type == RoadmapQuestionType.cascade:
            answer.update({"value": [int(float(o)) for o in self.options]})
        return answer

    @property
    def to_dict(self) -> TypedDict:
        return {
            f"{self.question}_{self.repeat_index}": {
                "value": self.text or self.value or self.options,
                "repeat_index": self.repeat_index,
                "data": self,
            }
        }

    @property
    def only_value(self) -> List:
        q = self.question_detail
        type = q.type
        if type in [RoadmapQuestionType.input,
                    RoadmapQuestionType.text,
                    RoadmapQuestionType.date]:
            return self.text
        if type == RoadmapQuestionType.number:
            answer = self.value
            if q.rule:
                if q.rule.get("allow_decimal"):
                    answer = float(answer) if answer else None
            else:
                answer = int(answer) if answer else None
            return answer
        if type == RoadmapQuestionType.option:
            return self.options[0] if self.options else None
        if type in [
            RoadmapQuestionType.multiple_option,
            RoadmapQuestionType.cascade,
            RoadmapQuestionType.nested_list,
        ]:
            return self.options
        if type == RoadmapQuestionType.cascade:
            return [int(float(o)) for o in self.options]
        return None

    @property
    def simplified(self) -> TypedDict:
        q = self.question_detail
        date = self.updated or self.created
        type = q.type
        answer = None
        if type in [RoadmapQuestionType.input,
                    RoadmapQuestionType.text,
                    RoadmapQuestionType.date]:
            answer = self.text
        if type == RoadmapQuestionType.number:
            answer = self.value
            if q.rule:
                if q.rule.get("allow_decimal"):
                    answer = float(answer) if answer else None
            else:
                answer = int(answer) if answer else None
        if type == RoadmapQuestionType.option:
            answer = self.options[0] if self.options else None
        if type in [
            RoadmapQuestionType.multiple_option,
            RoadmapQuestionType.cascade,
            RoadmapQuestionType.nested_list,
        ]:
            return self.options
        if type == RoadmapQuestionType.cascade:
            return [int(float(o)) for o in self.options]
        return {
            "value": answer,
            "repeat_index": self.repeat_index,
            "date": date.strftime("%B %d, %Y"),
        }


class RoadmapAnswerBase(BaseModel):
    id: int
    question: int
    data: int
    text: Optional[str] = None
    value: Optional[float] = None
    options: Optional[List[str]] = None
    table: Optional[List[dict]] = None
    repeat_index: Optional[int] = None
    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    class Config:
        orm_mode = True
