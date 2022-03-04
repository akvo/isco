# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from typing import Optional
from typing_extensions import TypedDict
from sqlalchemy import Enum, Integer, String
from sqlalchemy import Column, ForeignKey
from sqlalchemy.orm import relationship
from db.connection import Base
from pydantic import BaseModel
from models.question import QuestionType


class OperatorType(enum.Enum):
    equal = '=='
    not_equal = '!='
    greater_than = '>'
    less_than = '<'
    greater_than_or_equal = '>='
    less_than_or_equal = '<='


class SkipLogicDict(TypedDict):
    id: int
    question: int
    dependent_to: int
    operator: OperatorType
    value: str
    type: QuestionType


class SkipLogic(Base):
    __tablename__ = "skip_logic"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(Integer, ForeignKey('question.id'))
    dependent_to = Column(Integer, ForeignKey('question.id'))
    operator = Column(Enum(OperatorType))
    value = Column(String)
    type = Column(Enum(QuestionType))
    question = relationship("Question",
                            backref="skip_logic")

    def __init__(self, id: Optional[int], question: int, dependent_to: int,
                 operator: OperatorType, value: str, type: QuestionType):
        self.id = id
        self.question = question
        self.dependent_to = dependent_to
        self.operator = operator
        self.value = value
        self.type = type

    def __repr__(self) -> int:
        return f"<SkipLogic {self.id}>"

    @property
    def serialize(self) -> SkipLogicDict:
        return {
            "id": self.id,
            "question": self.question,
            "dependent_to": self.dependent_to,
            "operator": self.operator,
            "value": self.value,
            "type": self.type
        }


class SkipLogicBase(BaseModel):
    id: int
    question: int
    dependent_to: int
    operator: OperatorType
    value: str
    type: QuestionType

    class Config:
        orm_mode = True
