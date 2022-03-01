# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional, List
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from sqlalchemy import Boolean, DateTime
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base
from datetime import datetime


class QuestionGroupDict(TypedDict):
    id: int
    name: str
    translations: Optional[List[dict]] = None
    repeat: bool


class QuestionGroup(Base):
    __tablename__ = "question_group"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    repeat = Column(Boolean, default=False)
    created = Column(DateTime, default=datetime.utcnow)
    question = relationship("Question",
                            cascade="all, delete",
                            passive_deletes=True,
                            backref="question_group_detail")

    def __init__(self, id: Optional[int], name: str,
                 translations: Optional[List[dict]],
                 repeat: Optional[bool]):
        self.id = id
        self.name = name
        self.translations = translations
        self.repeat = repeat

    def __repr__(self) -> int:
        return f"<QuestionGroup {self.id}>"

    @property
    def serialize(self) -> QuestionGroupDict:
        return {
            "id": self.id,
            "name": self.name,
            "translations": self.translations,
            "repeat": self.repeat
        }


class QuestionGroupBase(BaseModel):
    id: int
    name: str
    translations: Optional[List[dict]] = None
    repeat: bool

    class Config:
        orm_mode = True
