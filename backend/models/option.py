# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional, List
from typing_extensions import TypedDict
from db.connection import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from pydantic import BaseModel
import sqlalchemy.dialects.postgresql as pg


class OptionPayload(TypedDict):
    code: Optional[str] = None
    name: str
    question: int
    translations: Optional[List[dict]] = None


class OptionDict(TypedDict):
    id: int
    code: Optional[str] = None
    name: str
    translations: Optional[List[dict]] = None


class Option(Base):
    __tablename__ = "option"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(Integer, ForeignKey('question.id'))
    code = Column(String, nullable=True)
    name = Column(String)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)

    def __init__(self, id: Optional[int], code: Optional[str], name: str,
                 question: int, translations: Optional[List[dict]]):
        self.id = id
        self.code = code
        self.name = name
        self.translations = translations
        self.question = question

    def __repr__(self) -> int:
        return f"<Option {self.id}>"

    @property
    def serialize(self) -> OptionDict:
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "translations": self.translations
        }


class OptionBase(BaseModel):
    id: int
    code: Optional[str] = None
    name: str
    translations: Optional[List[dict]] = None
