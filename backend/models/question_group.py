# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from typing import Optional, List
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from sqlalchemy import Boolean, DateTime, Enum
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base
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


class QuestionGroupDict(TypedDict):
    id: int
    name: str
    translations: Optional[List[dict]] = None
    member_type: List[MemberType]
    isco_type: List[IscoType]
    repeat: bool


class QuestionGroup(Base):
    __tablename__ = "question_group"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    member_type = Column(pg.ARRAY(Enum(MemberType)))
    isco_type = Column(pg.ARRAY(Enum(IscoType)))
    repeat = Column(Boolean, default=False)
    created = Column(DateTime, default=datetime.utcnow)

    def __init__(self, id: Optional[int], name: str,
                 translations: Optional[List[dict]],
                 member_type: List[MemberType],
                 isco_type: List[IscoType],
                 repeat: Optional[bool]):
        self.id = id
        self.name = name
        self.translations = translations
        self.member_type = member_type
        self.isco_type = isco_type
        self.repeat = repeat

    def __repr__(self) -> int:
        return f"<QuestionGroup {self.id}>"

    @property
    def serialize(self) -> QuestionGroupDict:
        return {
            "id": self.id,
            "name": self.name,
            "translations": self.translations,
            "member_type": self.member_type,
            "isco_type": self.isco_type,
            "repeat": self.repeat
        }


class QuestionGroupBase(BaseModel):
    id: int
    name: str
    translations: Optional[List[dict]] = None
    member_type: List[MemberType]
    isco_type: List[IscoType]
    repeat: bool

    class Config:
        orm_mode = True
