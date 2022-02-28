# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from db.connection import Base
from pydantic import BaseModel
from typing import Optional, List
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.ext.mutable import MutableDict
from .question_group import MemberType, IscoType
import sqlalchemy.dialects.postgresql as pg


class QuestionType(enum.Enum):
    text = 'text'
    number = 'number'
    single_select = 'single_select'
    multiple_select = 'multiple_select'
    date = 'date'
    nested_list = 'nested_list'
    cascade = 'cascade'


class QuestionDict(TypedDict):
    id: int
    name: str
    translations: Optional[List[dict]] = None
    mandatory: bool
    type: QuestionType
    member_type: List[MemberType]
    isco_type: List[IscoType]
    personal_data: bool
    rule: Optional[dict] = None
    tooltip: Optional[str] = None
    tooltip_translations: Optional[List[dict]] = None


class Question(Base):
    __tablename__ = "question"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    mandatory = Column(Boolean, default=True)
    type = Column(Enum(QuestionType()), default=QuestionType.text)
    member_type = Column(pg.ARRAY(Enum(MemberType)))
    isco_type = Column(pg.ARRAY(Enum(IscoType)))
    personal_data = Column(Boolean, default=False)
    rule = Column(MutableDict.as_mutable(pg.JSONB), nullable=True)
    tooltip = Column(String, nullable=True)
    tooltip_translations = Column(pg.ARRAY(pg.JSONB), nullable=True)

    def __init__(self, id: Optional[int], name: str,
                 translations: Optional[List[dict]], mandatory: Optional[bool],
                 type: QuestionType, member_type: List[MemberType],
                 isco_type: List[IscoType], personal_data: Optional[bool],
                 rule: Optional[dict], tooltip: Optional[str],
                 tooltip_translations: Optional[List[dict]]):
        self.id = id
        self.name = name
        self.translations = translations
        self.mandatory = mandatory
        self.type = type
        self.member_type = member_type
        self.isco_type = isco_type
        self.personal_data = personal_data
        self.rule = rule
        self.tooltip = tooltip
        self.tooltip_translations = tooltip_translations

    def __repr__(self) -> int:
        return f"<Question {self.id}>"

    @property
    def serialize(self) -> QuestionDict:
        return {
            "id": self.id,
            "name": self.name,
            "translations": self.translations,
            "mandatory": self.mandatory,
            "type": self.type,
            "member_type": self.member_type,
            "isco_type": self.isco_type,
            "personal_data": self.personal_data,
            "rule": self.rule,
            "tooltip": self.tooltip,
            "tooltip_translations": self.tooltip_translations
        }


class QuestionBase(BaseModel):
    id: int
    name: str
    translations: Optional[List[dict]] = None
    mandatory: bool
    type: QuestionType
    member_type: List[MemberType]
    isco_type: List[IscoType]
    personal_data: bool
    rule: Optional[dict] = None
    tooltip: Optional[str] = None
    tooltip_translations: Optional[List[dict]] = None
