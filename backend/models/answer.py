# Please don't use **kwargs
# Keep the code clean and CLEAR

from datetime import datetime
from typing_extensions import TypedDict
from typing import Optional, List, Union
from pydantic import BaseModel
from .question import QuestionType
from sqlalchemy import Column, Integer, Float, Text, String
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base


class AnswerDictWithId(TypedDict):
    id: int
    question: int
    repeat_index: Optional[int] = None
    comment: Optional[str] = None
    value: Optional[
        Union[float, int, str, bool, dict, List[float], List[int], List[str]]
    ] = None


class AnswerDict(TypedDict):
    question: int
    repeat_index: Optional[int] = None
    comment: Optional[str] = None
    value: Optional[
        Union[float, int, str, bool, dict, List[float], List[int], List[str]]
    ] = None


class AnswerDictWithQuestionName(TypedDict):
    question_group: str
    question_group_order: int
    question: int
    question_name: str
    question_order: int
    repeat_index: Optional[int] = None
    comment: Optional[str] = None
    is_repeat_identifier: Optional[bool] = False
    value: Optional[
        Union[float, int, str, bool, dict, List[float], List[int], List[str]]
    ] = None


class Answer(Base):
    __tablename__ = "answer"
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        nullable=True,
        autoincrement=True,
    )
    question = Column(
        Integer,
        ForeignKey("question.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    data = Column(
        Integer,
        ForeignKey("data.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    text = Column(Text, nullable=True)
    value = Column(Float, nullable=True)
    options = Column(pg.ARRAY(String), nullable=True)
    comment = Column(Text, nullable=True)
    repeat_index = Column(Integer, nullable=True, default=0)
    created = Column(DateTime, nullable=True)
    updated = Column(DateTime, nullable=True)
    question_detail = relationship("Question", backref="answer")

    def __init__(
        self,
        question: int,
        created: datetime,
        data: Optional[int] = None,
        text: Optional[str] = None,
        value: Optional[float] = None,
        options: Optional[List[str]] = None,
        comment: Optional[str] = None,
        repeat_index: Optional[int] = None,
        updated: Optional[datetime] = None,
    ):
        self.question = question
        self.data = data
        self.text = text
        self.value = value
        self.options = options
        self.comment = comment
        self.repeat_index = repeat_index
        self.updated = updated
        self.created = created

    def __repr__(self) -> int:
        return f"<Answer {self.id}>"

    @property
    def serialize(self) -> AnswerDict:
        return {
            "id": self.id,
            "question": self.question,
            "data": self.data,
            "text": self.text,
            "value": self.value,
            "options": self.options,
            "comment": self.comment,
            "repeat_index": self.repeat_index,
            "created": self.created,
            "updated": self.updated,
        }

    @property
    def formatted(self) -> AnswerDict:
        answer = {
            "question": self.question,
            "repeat_index": self.repeat_index,
            "comment": self.comment,
        }
        q = self.question_detail
        type = q.type
        if type in [
            QuestionType.input,
            QuestionType.text,
            QuestionType.date,
            QuestionType.autofield,
        ]:
            answer.update({"value": self.text})
        if type == QuestionType.number:
            val = self.value
            if q.rule:
                if q.rule.get("allow_decimal"):
                    val = float(val) if val or val == 0 else None
            else:
                val = int(val) if val or val == 0 else None
            answer.update({"value": val})
        if type == QuestionType.option:
            answer.update({"value": self.options[0]})
        if type in [QuestionType.multiple_option, QuestionType.nested_list]:
            answer.update({"value": self.options})
        if type == QuestionType.cascade:
            answer.update({"value": [int(float(o)) for o in self.options]})
        return answer

    @property
    def formattedWithQuestionName(self) -> AnswerDictWithQuestionName:
        q = self.question_detail
        question_group = q.question_group_detail
        answer = {
            "question_group": question_group.name,
            "question_group_order": question_group.order,
            "question": self.question,
            "question_name": q.name,
            "question_order": q.order,
            "repeat_index": self.repeat_index,
            "is_repeat_identifier": self.question_detail.is_repeat_identifier,
            "comment": self.comment,
        }
        type = q.type
        if type in [
            QuestionType.input,
            QuestionType.text,
            QuestionType.date,
            QuestionType.autofield,
        ]:
            answer.update({"value": self.text})
        if type == QuestionType.number:
            val = self.value
            if q.rule:
                if q.rule.get("allow_decimal"):
                    val = float(val) if val or val == 0 else None
            else:
                val = int(val) if val or val == 0 else None
            answer.update({"value": val})
        if type == QuestionType.option:
            answer.update({"value": self.options[0]})
        if type in [QuestionType.multiple_option, QuestionType.nested_list]:
            answer.update({"value": self.options})
        if type == QuestionType.cascade:
            answer.update({"value": [int(float(o)) for o in self.options]})
        return answer

    @property
    def format_with_answer_id(self) -> AnswerDictWithId:
        answer = {
            "id": self.id,
            "question": self.question,
            "repeat_index": self.repeat_index,
            "comment": self.comment,
        }
        q = self.question_detail
        type = q.type
        if type in [
            QuestionType.input,
            QuestionType.text,
            QuestionType.date,
            QuestionType.autofield,
        ]:
            answer.update({"value": self.text})
        if type == QuestionType.number:
            val = self.value
            if q.rule:
                if q.rule.get("allow_decimal"):
                    val = float(val) if val or val == 0 else None
            else:
                val = int(val) if val or val == 0 else None
            answer.update({"value": val})
        if type == QuestionType.option:
            answer.update({"value": self.options[0]})
        if type in [QuestionType.multiple_option, QuestionType.nested_list]:
            answer.update({"value": self.options})
        if type == QuestionType.cascade:
            answer.update({"value": [int(float(o)) for o in self.options]})
        return answer

    @property
    def to_dict(self):
        return {
            f"{self.question}_{self.repeat_index}": {
                "value": self.text or self.value or self.options,
                "repeat_index": self.repeat_index,
                "comment": self.comment,
                "data": self,
            }
        }

    @property
    def only_value(self) -> List:
        q = self.question_detail
        type = q.type
        if type in [
            QuestionType.input,
            QuestionType.text,
            QuestionType.date,
            QuestionType.autofield,
        ]:
            return self.text
        if type == QuestionType.number:
            answer = self.value
            if q.rule:
                if q.rule.get("allow_decimal"):
                    answer = float(answer) if answer else None
            else:
                answer = int(answer) if answer else None
            return answer
        if type == QuestionType.option:
            return self.options[0] if self.options else None
        if type in [
            QuestionType.multiple_option,
            QuestionType.cascade,
            QuestionType.nested_list,
        ]:
            return self.options
        if type == QuestionType.cascade:
            return [int(float(o)) for o in self.options]
        return None

    @property
    def simplified(self):
        q = self.question_detail
        date = self.updated or self.created
        type = q.type
        answer = None
        if type in [
            QuestionType.input,
            QuestionType.text,
            QuestionType.date,
            QuestionType.autofield,
        ]:
            answer = self.text
        if type == QuestionType.number:
            answer = self.value
            if q.rule:
                if q.rule.get("allow_decimal"):
                    answer = float(answer) if answer else None
            else:
                answer = int(answer) if answer else None
        if type == QuestionType.option:
            answer = self.options[0] if self.options else None
        if type in [
            QuestionType.multiple_option,
            QuestionType.cascade,
            QuestionType.nested_list,
        ]:
            return self.options
        if type == QuestionType.cascade:
            return [int(float(o)) for o in self.options]
        return {
            "value": answer,
            "repeat_index": self.repeat_index,
            "comment": self.comment,
            "date": date.strftime("%B %d, %Y"),
        }

    @property
    def to_data_frame(self) -> dict:
        answer = None
        q = self.question_detail
        qname = f"{self.question_detail.id}|{self.question_detail.name}"
        if q.type in [
            QuestionType.input,
            QuestionType.text,
            QuestionType.date,
            QuestionType.autofield,
        ]:
            answer = self.text
        if q.type == QuestionType.number:
            answer = self.value
            if q.rule:
                if q.rule.get("allow_decimal"):
                    answer = float(answer) if answer else None
            else:
                answer = int(answer) if answer else None
        if q.type == QuestionType.option:
            answer = self.options[0] if self.options else None
        if q.type in [
            QuestionType.multiple_option,
            QuestionType.cascade,
            QuestionType.nested_list,
        ]:
            answer = "|".join(self.options) if self.options else None
        return {qname: answer}

    @property
    def to_report(self) -> dict:
        answer = None
        q = self.question_detail
        value_type = "string"
        if q.type in [
            QuestionType.input,
            QuestionType.text,
            QuestionType.date,
            QuestionType.autofield,
        ]:
            answer = self.text
        if q.type == QuestionType.number:
            answer = self.value
            if q.rule:
                if q.rule.get("allow_decimal"):
                    answer = float(answer) if answer else None
            else:
                answer = int(answer) if answer else None
            if q.repeating_objects:
                unit = list(
                    filter(lambda x: x["field"] == "unit", q.repeating_objects)
                )
                if unit:
                    unit = unit[0].get("value")
                else:
                    unit = ""
                answer = f"{answer} {unit}" if answer else None
        if q.type == QuestionType.option:
            answer = self.options[0] if self.options else None
        if q.type in [
            QuestionType.option,
            QuestionType.multiple_option,
            QuestionType.cascade,
            QuestionType.nested_list,
        ]:
            answer = self.options
            value_type = "list"
        if q.type == QuestionType.cascade:
            answer = " - ".join(answer) if answer else None
            value_type = "string"
        return {
            "group": q.question_group,
            "order": q.order,
            "question_type": q.type,
            "name": q.name,
            "value": answer,
            "value_type": value_type,
            "repeat": self.repeat_index,
            "comment": self.comment,
            "tooltip": q.tooltip,
        }


class AnswerBase(BaseModel):
    id: int
    question: int
    data: int
    text: Optional[str] = None
    value: Optional[float] = None
    options: Optional[List[str]] = None
    comment: Optional[List[str]] = None
    repeat_index: Optional[int] = None
    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    class Config:
        orm_mode = True
