# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer
from sqlalchemy import ForeignKey
from db.connection import Base


class QuestionGroupIscoAccessPayload(TypedDict):
    question_group: Optional[int] = None
    isco_type: int


class QuestionGroupIscoAccessDict(TypedDict):
    id: int
    question_group: int
    isco_type: int


class QuestionGroupIscoAccess(Base):
    __tablename__ = "question_group_isco_access"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question_group = Column(Integer, ForeignKey('question_group.id'))
    isco_type = Column(Integer, ForeignKey('isco_type.id'))

    def __init__(self, id: Optional[int], question_group: int,
                 isco_type: int):
        self.id = id
        self.question_group = question_group
        self.isco_type = isco_type

    def __repr__(self) -> int:
        return f"<QuestionGroupIscoAccess {self.id}>"

    @property
    def serialize(self) -> QuestionGroupIscoAccessDict:
        return {
            "id": self.id,
            "question_group": self.question_group,
            "isco_type": self.isco_type
        }


class QuestionGroupIscoAccessBase(BaseModel):
    id: Optional[int]
    question_group: int
    isco_type: int

    class Config:
        orm_mode = True
