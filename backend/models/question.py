# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from db.connection import Base
from pydantic import BaseModel
from typing import Optional, List
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy import Boolean, Enum, ForeignKey
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import relationship
from models.option import OptionBase
import sqlalchemy.dialects.postgresql as pg
from datetime import datetime


class MemberType(enum.Enum):
    big_industry = 'Big Industry'
    small_industry = 'Small Industry'
    disco = 'DISCO - Traders'
    retail = 'Retail'
    standard_setting_org = 'Standard Setting Organisation'
    other = 'Other'


class IscoType(enum.Enum):
    isco = 'ISCO'


class QuestionType(enum.Enum):
    text = 'text'
    number = 'number'
    single_select = 'single_select'
    multiple_select = 'multiple_select'
    date = 'date'
    nested_list = 'nested_list'
    cascade = 'cascade'


class RuleDict(TypedDict):
    allow_other: Optional[bool] = None
    allow_negative: Optional[bool] = None
    allow_decimal: Optional[bool] = None
    min: Optional[int] = None
    max: Optional[int] = None


class RepeatingObjectType(enum.Enum):
    unit = 'unit'
    indicator = 'indicator'


class RepeatingObjectDict(TypedDict):
    key: RepeatingObjectType
    value: str


class QuestionDict(TypedDict):
    id: int
    form: int
    question_group: int
    name: str
    translations: Optional[List[dict]] = None
    mandatory: bool
    datapoint_name: bool
    variable_name: Optional[str] = None
    type: QuestionType
    member_type: List[MemberType]
    isco_type: List[IscoType]
    personal_data: bool
    rule: Optional[RuleDict] = None
    tooltip: Optional[str] = None
    tooltip_translations: Optional[List[dict]] = None
    cascade: Optional[int] = None
    repeating_objects: Optional[List[RepeatingObjectDict]] = None
    options: Optional[List[OptionBase]] = None


class Question(Base):
    __tablename__ = "question"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    form = Column(Integer, ForeignKey('form.id'))
    question_group = Column(Integer, ForeignKey('question_group.id'))
    name = Column(String)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    mandatory = Column(Boolean, default=True)
    datapoint_name = Column(Boolean, default=False)
    variable_name = Column(String, nullable=True, unique=True)
    type = Column(Enum(QuestionType), default=QuestionType.text)
    member_type = Column(pg.ARRAY(Enum(MemberType)))
    isco_type = Column(pg.ARRAY(Enum(IscoType)))
    personal_data = Column(Boolean, default=False)
    rule = Column(MutableDict.as_mutable(pg.JSONB), nullable=True)
    tooltip = Column(String, nullable=True)
    tooltip_translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    cascade = Column(Integer, ForeignKey('cascade.id'), nullable=True)
    repeating_objects = Column(pg.ARRAY(pg.JSONB), nullable=True)
    created = Column(DateTime, default=datetime.utcnow)
    options = relationship("Option",
                           cascade="all, delete",
                           passive_deletes=True,
                           backref="question_detail")

    def __init__(self, id: Optional[int], name: str, form: int,
                 question_group: int, translations: Optional[List[dict]],
                 mandatory: Optional[bool], datapoint_name: Optional[bool],
                 variable_name: Optional[str], type: QuestionType,
                 member_type: List[MemberType], isco_type: List[IscoType],
                 personal_data: Optional[bool], rule: Optional[RuleDict],
                 tooltip: Optional[str], cascade: Optional[int],
                 tooltip_translations: Optional[List[dict]],
                 repeating_objects: Optional[List[RepeatingObjectDict]]):
        self.id = id
        self.form = form
        self.question_group = question_group
        self.name = name
        self.translations = translations
        self.mandatory = mandatory
        self.datapoint_name = datapoint_name
        self.variable_name = variable_name
        self.type = type
        self.member_type = member_type
        self.isco_type = isco_type
        self.personal_data = personal_data
        self.rule = rule
        self.tooltip = tooltip
        self.tooltip_translations = tooltip_translations
        self.cascade = cascade
        self.repeating_objects = repeating_objects

    def __repr__(self) -> int:
        return f"<Question {self.id}>"

    @property
    def serialize(self) -> QuestionDict:
        return {
            "id": self.id,
            "form": self.form,
            "question_group": self.question_group,
            "name": self.name,
            "translations": self.translations,
            "mandatory": self.mandatory,
            "datapoint_name": self.datapoint_name,
            "variable_name": self.variable_name,
            "type": self.type,
            "member_type": self.member_type,
            "isco_type": self.isco_type,
            "personal_data": self.personal_data,
            "rule": self.rule,
            "tooltip": self.tooltip,
            "tooltip_translations": self.tooltip_translations,
            "cascade": self.cascade,
            "repeating_objects": self.repeating_objects,
            "options": self.options,
        }


class QuestionBase(BaseModel):
    id: int
    form: int
    question_group: int
    name: str
    translations: Optional[List[dict]] = None
    mandatory: bool
    datapoint_name: bool
    variable_name: Optional[str] = None
    type: QuestionType
    member_type: List[MemberType]
    isco_type: List[IscoType]
    personal_data: bool
    rule: Optional[RuleDict] = None
    tooltip: Optional[str] = None
    tooltip_translations: Optional[List[dict]] = None
    cascade: Optional[int] = None
    repeating_objects: Optional[List[RepeatingObjectDict]] = None
    options: Optional[List[OptionBase]] = None

    class Config:
        orm_mode = True
