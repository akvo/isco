# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from db.connection import Base
from pydantic import BaseModel
from typing import Optional, List
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy import Boolean, Enum, ForeignKey, BigInteger
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import relationship
from models.roadmap_option import RoadmapOptionBase, RoadmapOptionJson
import sqlalchemy.dialects.postgresql as pg
from datetime import datetime


class RoadmapQuestionType(enum.Enum):
    input = 'input'
    text = 'text'
    number = 'number'
    option = 'option'
    multiple_option = 'multiple_option'
    date = 'date'
    nested_list = 'nested_list'
    cascade = 'cascade'
    table = 'table'


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
    field: RepeatingObjectType
    value: str


class RoadmapQuestionDict(TypedDict):
    id: int
    question_group: int
    name: str
    columns: Optional[List[dict]] = []
    translations: Optional[List[dict]] = []
    dependency: Optional[List[dict]] = []
    mandatory: bool
    datapoint_name: bool
    variable_name: Optional[str] = None
    type: RoadmapQuestionType
    personal_data: bool
    rule: Optional[dict] = None
    tooltip: Optional[str] = None
    tooltip_translations: Optional[List[dict]] = []
    cascade: Optional[int] = None
    repeating_objects: Optional[List] = []
    order: Optional[int] = None


class RoadmapQuestionTypeDict(TypedDict):
    id: int
    type: RoadmapQuestionType


class RoadmapQuestion(Base):
    __tablename__ = "roadmap_question"
    id = Column(BigInteger, primary_key=True, index=True, nullable=True)
    question_group = Column(
        BigInteger, ForeignKey('roadmap_question_group.id'))
    name = Column(String)
    columns = Column(pg.ARRAY(pg.JSONB), nullable=True)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    dependency = Column(pg.ARRAY(pg.JSONB), nullable=True)
    mandatory = Column(Boolean, default=False)
    datapoint_name = Column(Boolean, default=False)
    variable_name = Column(String, nullable=True, unique=True)
    type = Column(Enum(RoadmapQuestionType), default=RoadmapQuestionType.input)
    personal_data = Column(Boolean, default=False)
    rule = Column(MutableDict.as_mutable(pg.JSONB), nullable=True)
    tooltip = Column(String, nullable=True)
    tooltip_translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    cascade = Column(Integer, nullable=True)
    repeating_objects = Column(pg.ARRAY(pg.JSONB), nullable=True)
    created = Column(DateTime, default=datetime.utcnow)
    order = Column(Integer, nullable=True)
    option = relationship(
        "RoadmapOption",
        primaryjoin="RoadmapOption.question==RoadmapQuestion.id",
        cascade="all, delete",
        passive_deletes=True,
        backref="roadmap_question_option")

    def __init__(
        self, id: Optional[int], name: str, question_group: int,
        columns: Optional[List[dict]], translations: Optional[List[dict]],
        dependency: Optional[List[dict]], mandatory: Optional[bool],
        datapoint_name: Optional[bool], variable_name: Optional[str],
        type: RoadmapQuestionType, personal_data: Optional[bool],
        rule: Optional[dict], tooltip: Optional[str], cascade: Optional[int],
        tooltip_translations: Optional[List[dict]],
        repeating_objects: Optional[List], order: Optional[int]
    ):
        self.id = id
        self.question_group = question_group
        self.name = name
        self.columns = columns
        self.translations = translations
        self.dependency = dependency
        self.mandatory = mandatory
        self.datapoint_name = datapoint_name
        self.variable_name = variable_name
        self.type = type
        self.personal_data = personal_data
        self.rule = rule
        self.tooltip = tooltip
        self.tooltip_translations = tooltip_translations
        self.cascade = cascade
        self.repeating_objects = repeating_objects
        self.order = order

    def __repr__(self) -> int:
        return f"<RoadmapQuestion {self.id}>"

    @property
    def only_id(self) -> int:
        return self.id

    @property
    def serialize(self) -> RoadmapQuestionDict:
        translations = []
        if self.translations:
            translations = self.translations

        tooltip_translations = []
        if self.tooltip_translations:
            tooltip_translations = self.tooltip_translations

        repeating_objects = []
        if self.repeating_objects:
            repeating_objects = self.repeating_objects

        return {
            "id": self.id,
            "question_group": self.question_group,
            "name": self.name,
            "columns": self.columns,
            "translations": translations,
            "dependency": self.dependency,
            "mandatory": self.mandatory,
            "datapoint_name": self.datapoint_name,
            "variable_name": self.variable_name,
            "type": self.type,
            "personal_data": self.personal_data,
            "rule": self.rule,
            "tooltip": self.tooltip,
            "tooltip_translations": tooltip_translations,
            "cascade": self.cascade,
            "repeating_objects": repeating_objects,
            "option": [opt.serialize for opt in self.option],
            "order": self.order
        }

    @property
    def serializeType(self) -> RoadmapQuestionTypeDict:
        return {
            "id": self.id,
            "type": self.type.value
        }

    @property
    def serializeJson(self):
        question = {
            "id": self.id,
            "name": self.name,
            "required": self.mandatory,
            "meta": self.datapoint_name,
            "type": self.type.value,
            "order": self.order,
        }
        if self.rule:
            if "allow_other" not in self.rule:
                question.update({"rule": self.rule})
            if "allow_decimal" in self.rule:
                question.get('rule').update({"allowDecimal": True})
            if "allow_other" in self.rule:
                question.update({"allowOther": self.rule['allow_other']})
                question.update({"allowOtherText": "Other"})
        if self.personal_data:
            question.update({"personal_data": self.personal_data})
        if self.variable_name:
            question.update({"variable_name": self.variable_name})
        if self.cascade:
            question.update({"cascade": self.cascade})
        if self.translations:
            question.update({"translations": self.translations})
        if self.option:
            question.update({
                "option": [opt.serializeJson for opt in self.option]})
        if self.repeating_objects:
            question.update({"repeating_objects": self.repeating_objects})
        if self.tooltip:
            tooltip = {"text": self.tooltip}
            if self.tooltip_translations:
                temp = []
                for t in self.tooltip_translations:
                    temp.append({
                        "language": t['language'],
                        "text": t['tooltip_translations']
                    })
                tooltip.update({"translations": temp})
            question.update({"tooltip": tooltip})
        if self.dependency:
            question.update({"dependency": self.dependency})
        return question


class RoadmapQuestionBase(BaseModel):
    id: int
    question_group: int
    name: str
    columns: Optional[List[dict]] = []
    translations: Optional[List[dict]] = []
    dependency: Optional[List[dict]] = []
    mandatory: bool
    datapoint_name: bool
    variable_name: Optional[str] = None
    type: RoadmapQuestionType
    personal_data: bool
    rule: Optional[dict] = None
    tooltip: Optional[str] = None
    tooltip_translations: Optional[List[dict]] = []
    cascade: Optional[int] = None
    repeating_objects: Optional[List] = []
    option: Optional[List[RoadmapOptionBase]] = []
    order: Optional[int] = None

    class Config:
        orm_mode = True


class RoadmapQuestionJson(BaseModel):
    id: int
    name: str
    translations: Optional[List[dict]] = []
    required: bool
    order: Optional[int] = None
    meta: bool
    variable_name: Optional[str] = None
    type: RoadmapQuestionType
    personal_data: bool
    rule: Optional[dict] = None
    tooltip: Optional[dict] = None
    cascade: Optional[int] = None
    repeating_objects: Optional[List] = []
    option: Optional[List[RoadmapOptionJson]] = []
    dependency: Optional[List[dict]] = []

    class Config:
        orm_mode = True
