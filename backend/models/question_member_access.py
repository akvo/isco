# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer
from sqlalchemy import ForeignKey
from db.connection import Base


class QuestionMemberAccessPayload(TypedDict):
    question: Optional[int] = None
    member_type: int


class QuestionMemberAccessDict(TypedDict):
    id: int
    question: int
    member_type: int


class QuestionMemberAccess(Base):
    __tablename__ = "question_member_access"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(Integer, ForeignKey('question.id'))
    member_type = Column(Integer, ForeignKey('member_type.id'))

    def __init__(self, id: Optional[int], question: int, member_type: int):
        self.id = id
        self.question = question
        self.member_type = member_type

    def __repr__(self) -> int:
        return f"<QuestionMemberAccess {self.id}>"

    @property
    def serialize(self) -> QuestionMemberAccessDict:
        return {
            "id": self.id,
            "question": self.question,
            "member_type": self.member_type
        }


class QuestionMemberAccessBase(BaseModel):
    id: Optional[int]
    question: int
    member_type: int

    class Config:
        orm_mode = True
