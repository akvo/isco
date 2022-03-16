# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing_extensions import TypedDict
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from sqlalchemy import Text, DateTime
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base
from datetime import datetime
from models.question_group import QuestionGroupBase
from models.question_group import QuestionGroupJson


class FormPayload(TypedDict):
    name: str
    description: Optional[str] = None
    languages: Optional[List[str]] = None


class FormDict(TypedDict):
    id: int
    name: str
    description: Optional[str] = None
    languages: Optional[List[str]] = None
    created: str


class Form(Base):
    __tablename__ = "form"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    languages = Column(pg.ARRAY(String), nullable=True)
    created = Column(DateTime, default=datetime.utcnow)
    question_group = relationship("QuestionGroup",
                                  cascade="all, delete",
                                  passive_deletes=True,
                                  backref="form_detail")

    def __init__(self, id: Optional[int], name: str,
                 languages: Optional[List[str]],
                 description: Optional[str]):
        self.id = id
        self.name = name
        self.description = description
        self.languages = languages

    def __repr__(self) -> int:
        return f"<Form {self.id}>"

    @property
    def serialize(self) -> FormDict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "languages": self.languages,
            "created": self.created.strftime("%d-%m-%Y"),
            "question_group": [qg.serialize for qg in self.question_group]
        }


class FormBase(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    languages: Optional[List[str]] = None
    question_group: Optional[List[QuestionGroupBase]] = []

    class Config:
        orm_mode = True


class FormJson(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    languages: Optional[List[str]] = None
    question_group: Optional[List[QuestionGroupJson]] = []

    class Config:
        orm_mode = True
