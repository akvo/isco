# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer
from sqlalchemy import ForeignKey
from db.connection import Base


class QuestionIscoAccessDict(TypedDict):
    id: int
    question: int
    isco_type: int


class QuestionIscoAccess(Base):
    __tablename__ = "question_isco_access"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(Integer, ForeignKey('question.id'))
    isco_type = Column(Integer, ForeignKey('isco_type.id'))

    def __init__(self, id: Optional[int], question: int, isco_type: int):
        self.id = id
        self.question = question
        self.isco_type = isco_type

    def __repr__(self) -> int:
        return f"<QuestionIscoAccess {self.id}>"

    @property
    def serialize(self) -> QuestionIscoAccessDict:
        return {
            "id": self.id,
            "question": self.question,
            "isco_type": self.isco_type
        }


class QuestionIscoAccessBase(BaseModel):
    id: Optional[int]
    question: int
    isco_type: int

    class Config:
        orm_mode = True
