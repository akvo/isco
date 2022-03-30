# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from typing import Optional
from typing_extensions import TypedDict
from sqlalchemy import Enum, Integer, String
from sqlalchemy import Column, ForeignKey
from db.connection import Base
from pydantic import BaseModel


class QuestionType(enum.Enum):
    input = 'input'
    text = 'text'
    number = 'number'
    option = 'option'
    multiple_option = 'multiple_option'
    date = 'date'
    nested_list = 'nested_list'
    cascade = 'cascade'


class OperatorType(enum.Enum):
    equal = 'equal'
    not_equal = 'not_equal'
    greater_than = 'greater_than'
    less_than = 'less_than'
    greater_than_or_equal = 'greater_than_or_equal'
    less_than_or_equal = 'less_than_or_equal'


class SkipLogicPayload(TypedDict):
    question: Optional[int] = None
    dependent_to: int
    operator: OperatorType
    value: str
    type: QuestionType


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

    @property
    def serializeJson(self):
        return {
            "dependent_to": self.dependent_to,
            "operator": self.operator,
            "value": self.value,
            "type": self.type.value
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
