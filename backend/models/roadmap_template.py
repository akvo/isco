# Please don't use **kwargs
# Keep the code clean and CLEAR

from db.connection import Base
from typing import Optional
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, Integer, BigInteger
from sqlalchemy import Boolean, ForeignKey


class RoadmapTemplateDict(TypedDict):
    id: int
    organisation: int
    question: int
    mandatory: bool


class RoadmapTemplate(Base):
    __tablename__ = "roadmap_template"
    id = Column(
        Integer, primary_key=True, index=True, nullable=True)
    organisation = Column(Integer, ForeignKey('organisation.id'))
    question = Column(BigInteger, ForeignKey('roadmap_question.id'))
    mandatory = Column(Boolean, default=False)

    def __init__(
        self, organisation: int,
        question: int, mandatory: bool,
        id: Optional[int]
    ):
        self.id = id
        self.organisation = organisation
        self.question = question
        self.mandatory = mandatory

    def __repr__(self) -> int:
        return f"<RoadmapTemplate {self.id}>"

    @property
    def serialize(self) -> RoadmapTemplateDict:
        return {
            "id": self.id,
            "organisation": self.organisation,
            "question": self.question,
            "mandatory": self.mandatory
        }


class RoadmapTemplateBase(BaseModel):
    id: int
    organisation: int
    question: int
    mandatory: bool

    class Config:
        orm_mode = True
