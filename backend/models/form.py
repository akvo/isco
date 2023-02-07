# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from typing_extensions import TypedDict
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from sqlalchemy import Text, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base
from datetime import datetime
from models.question_group import QuestionGroupBase
from util.survey_config import MEMBER_SURVEY, PROJECT_SURVEY


class FormType(enum.Enum):
    project = 'project'
    member = 'member'


class FormInfo(TypedDict):
    id: int
    name: str
    description: Optional[str] = None
    version: Optional[float] = None


class FormPayload(TypedDict):
    name: str
    enable_prefilled_value: bool
    description: Optional[str] = None
    languages: Optional[List[str]] = None


class FormDict(TypedDict):
    id: int
    name: str
    description: Optional[str] = None
    languages: Optional[List[str]] = None
    version: Optional[float] = None
    url: Optional[str] = None
    created: Optional[str] = None
    published: Optional[str] = None


class FormDictWithGroupStatus(TypedDict):
    id: int
    name: str
    description: Optional[str] = None
    languages: Optional[List[str]] = None
    version: Optional[float] = None
    url: Optional[str] = None
    created: str
    published: Optional[str] = None
    has_question_group: bool


class FormOptions(TypedDict):
    label: str
    value: int
    disabled: bool
    enable_prefilled_value: bool
    form_type: Optional[str] = None


class Form(Base):
    __tablename__ = "form"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    languages = Column(pg.ARRAY(String), nullable=True)
    created = Column(DateTime, default=datetime.utcnow)
    version = Column(Float, nullable=True, default=0.0)
    url = Column(Text, nullable=True)
    published = Column(DateTime, nullable=True)
    enable_prefilled_value = Column(Boolean, default=False)
    question_group = relationship(
        "QuestionGroup", cascade="all, delete",
        passive_deletes=True, backref="form_detail")

    def __init__(
        self, id: Optional[int],
        name: str, description: Optional[str],
        enable_prefilled_value: bool,
        languages: Optional[List[str]]
    ):
        self.id = id
        self.name = name
        self.description = description
        self.languages = languages
        self.enable_prefilled_value = enable_prefilled_value

    def __repr__(self) -> int:
        return f"<Form {self.id}>"

    @property
    def serialize(self) -> FormDict:
        published = None
        if self.published:
            published = self.published.strftime("%d-%m-%Y")
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "languages": self.languages,
            "version": self.version,
            "url": self.url,
            "created": self.created.strftime("%d-%m-%Y"),
            "published": published,
            "question_group": [qg.serialize for qg in self.question_group]
        }

    @property
    def serializeWithGroupStatus(self) -> FormDictWithGroupStatus:
        published = None
        if self.published:
            published = self.published.strftime("%d-%m-%Y")
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "languages": self.languages,
            "version": self.version,
            "url": self.url,
            "created": self.created.strftime("%d-%m-%Y"),
            "published": published,
            "has_question_group": len(self.question_group) > 0,
        }

    @property
    def serializeJson(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "languages": self.languages,
            "question_group": [qg.serializeJson for qg in self.question_group],
            "version": self.version
        }

    @property
    def list_of_questions(self) -> TypedDict:
        question_list = {}
        for qg in self.question_group:
            for q in qg.question:
                question_list.update({q.id: q.type})
        return question_list

    @property
    def to_options(self) -> FormOptions:
        form_type = None
        if self.id in MEMBER_SURVEY:
            form_type = "member"
        if self.id in PROJECT_SURVEY:
            form_type = "project"
        return {
            "label": self.name,
            "value": self.id,
            "disabled": False,
            "form_type": form_type,
            "enable_prefilled_value": self.enable_prefilled_value
        }

    @property
    def info(self) -> FormInfo:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
        }

    @property
    def only_form_detail(self):
        return {
            "id": self.id,
            "name": self.name,
        }


class FormBase(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    languages: Optional[List[str]] = None
    version: Optional[float] = None
    url: Optional[str] = None
    question_group: Optional[List[QuestionGroupBase]] = []

    class Config:
        orm_mode = True


class FormJson(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    languages: Optional[List[str]] = None
    version: Optional[float] = None
    question_group: Optional[List[dict]] = []
    tree: Optional[dict] = None

    class Config:
        orm_mode = True
