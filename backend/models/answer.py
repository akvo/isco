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


class AnswerDict(TypedDict):
    question: int
    repeat_index: Optional[int] = None
    comment: Optional[str] = None
    value: Union[int, float, str, bool, dict, List[str], List[int],
                 List[float], None]


class Answer(Base):
    __tablename__ = "answer"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(Integer,
                      ForeignKey('question.id',
                                 onupdate="CASCADE",
                                 ondelete="CASCADE"),
                      primary_key=True)
    data = Column(Integer,
                  ForeignKey('data.id', onupdate="CASCADE",
                             ondelete="CASCADE"),
                  primary_key=True)
    text = Column(Text, nullable=True)
    value = Column(Float, nullable=True)
    options = Column(pg.ARRAY(String), nullable=True)
    comment = Column(Text, nullable=True)
    repeat_index = Column(Integer, nullable=True, default=0)
    created = Column(DateTime, nullable=True)
    updated = Column(DateTime, nullable=True)
    question_detail = relationship("Question", backref="answer")

    def __init__(self,
                 question: int,
                 created: datetime,
                 data: Optional[int] = None,
                 text: Optional[str] = None,
                 value: Optional[float] = None,
                 options: Optional[List[str]] = None,
                 comment: Optional[str] = None,
                 repeat_index: Optional[int] = None,
                 updated: Optional[datetime] = None):
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
            "comment": self.comment
        }
        type = self.question_detail.type
        if type in [QuestionType.input, QuestionType.text, QuestionType.date]:
            answer.update({"value": self.text})
        if type == QuestionType.number:
            answer.update({"value": self.value})
        if type == QuestionType.option:
            answer.update({"value": self.options[0]})
        if type in [QuestionType.multiple_option,
                    QuestionType.cascade,
                    QuestionType.nested_list]:
            answer.update({"value": self.options})
        return answer

    @property
    def to_dict(self) -> TypedDict:
        return {
            f"{self.question}_{self.repeat_index}": {
                "value": self.text or self.value or self.options,
                "repeat_index": self.repeat_index,
                "comment": self.comment,
                "data": self
            }
        }

    @property
    def only_value(self) -> List:
        type = self.question_detail.type
        if type in [QuestionType.number]:
            return self.value
        if type in [QuestionType.input, QuestionType.text, QuestionType.date]:
            return self.text
        if type == QuestionType.number:
            return self.value
        if type == QuestionType.option:
            return self.options[0] if self.options else None
        if type in [QuestionType.multiple_option,
                    QuestionType.cascade,
                    QuestionType.nested_list]:
            return self.options
        return None

    @property
    def simplified(self) -> TypedDict:
        date = self.updated or self.created
        type = self.question_detail.type
        answer = None
        if type in [QuestionType.input, QuestionType.text, QuestionType.date]:
            answer = self.text
        if type == QuestionType.number:
            answer = self.value
        if type == QuestionType.option:
            answer = self.options[0] if self.options else None
        if type in [QuestionType.multiple_option,
                    QuestionType.cascade,
                    QuestionType.nested_list]:
            answer = self.options
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
        if q.type in [QuestionType.input,
                      QuestionType.text,
                      QuestionType.date]:
            answer = self.text
        if q.type == QuestionType.number:
            answer = self.value
        if q.type == QuestionType.option:
            answer = self.options[0] if self.options else None
        if q.type in [QuestionType.multiple_option,
                      QuestionType.cascade,
                      QuestionType.nested_list]:
            answer = "|".join(self.options) if self.options else None
        return {qname: answer}


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
