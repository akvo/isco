# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer
from sqlalchemy import ForeignKey
from db.connection import Base
from sqlalchemy.orm import relationship, backref


class QuestionGroupMemberAccessPayload(TypedDict):
    question_group: Optional[int] = None
    member_type: int


class QuestionGroupMemberAccessDict(TypedDict):
    id: int
    question_group: int
    member_type: int


class QuestionGroupMemberAccess(Base):
    __tablename__ = "question_group_member_access"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question_group = Column(Integer, ForeignKey('question_group.id'))
    member_type = Column(Integer, ForeignKey('member_type.id'))
    member = relationship("MemberType",
                          backref=backref("member_type", uselist=False))

    def __init__(self, id: Optional[int], question_group: int,
                 member_type: int):
        self.id = id
        self.question_group = question_group
        self.member_type = member_type

    def __repr__(self) -> int:
        return f"<QuestionGroupMemberAccess {self.id}>"

    @property
    def serialize(self) -> QuestionGroupMemberAccessDict:
        return {
            "id": self.id,
            "question_group": self.question_group,
            "member_type": self.member_type
        }

    @property
    def memberName(self):
        return self.member.name


class QuestionGroupMemberAccessBase(BaseModel):
    id: Optional[int]
    question_group: int
    member_type: int

    class Config:
        orm_mode = True
