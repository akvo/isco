# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional, List
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from sqlalchemy import Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base
from datetime import datetime
from models.question import QuestionBase, QuestionJson


class QuestionGroupPayload(TypedDict):
    form: int
    name: str
    translations: Optional[List[dict]] = None
    order: Optional[int] = None
    repeat: Optional[bool] = None


class QuestionGroupDict(TypedDict):
    id: int
    form: int
    name: str
    translations: Optional[List[dict]] = None
    order: Optional[int] = None
    repeat: bool


class QuestionGroup(Base):
    __tablename__ = "question_group"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    form = Column(Integer, ForeignKey('form.id'))
    name = Column(String)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    repeat = Column(Boolean, default=False)
    order = Column(Integer, nullable=True)
    created = Column(DateTime, default=datetime.utcnow)
    question = relationship("Question",
                            cascade="all, delete",
                            passive_deletes=True,
                            backref="question_group_detail")

    def __init__(self, id: Optional[int], form: int, name: str,
                 translations: Optional[List[dict]],
                 repeat: Optional[bool], order: Optional[int]):
        self.id = id
        self.form = form
        self.name = name
        self.translations = translations
        self.order = order
        self.repeat = repeat

    def __repr__(self) -> int:
        return f"<QuestionGroup {self.id}>"

    @property
    def serialize(self) -> QuestionGroupDict:
        return {
            "id": self.id,
            "form": self.form,
            "name": self.name,
            "translations": self.translations,
            "order": self.order,
            "repeat": self.repeat,
            "question": self.question
        }


class QuestionGroupBase(BaseModel):
    id: int
    form: int
    name: str
    translations: Optional[List[dict]] = None
    order: Optional[int] = None
    repeat: bool
    question: Optional[List[QuestionBase]] = []

    class Config:
        orm_mode = True


class QuestionGroupJson(BaseModel):
    name: str
    translations: Optional[List[dict]] = None
    order: Optional[int] = None
    repeat: bool
    question: Optional[List[QuestionJson]] = []

    class Config:
        orm_mode = True
