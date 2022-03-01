# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing_extensions import TypedDict
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base
from datetime import datetime


class FormDict(TypedDict):
    id: int
    name: str
    languages: Optional[List[str]] = None


class Form(Base):
    __tablename__ = "form"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)
    languages = Column(pg.ARRAY(String), nullable=True)
    created = Column(DateTime, default=datetime.utcnow)
    question_groups = relationship("QuestionGroup",
                                   secondary="QuestionGroupQuestion",
                                   backref="question_group_detail")

    def __init__(self, id: Optional[int], name: str,
                 languages: Optional[List[str]]):
        self.id = id
        self.name = name
        self.languages = languages

    def __repr__(self) -> int:
        return f"<Form {self.id}>"

    @property
    def serialize(self) -> FormDict:
        return {
            "id": self.id,
            "name": self.name,
            "languages": self.languages,
        }


class FormBase(BaseModel):
    id: int
    name: str
    languages: Optional[List[str]] = None

    class Config:
        orm_mode = True
