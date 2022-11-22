# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional, List
from typing_extensions import TypedDict
from db.connection import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from pydantic import BaseModel
import sqlalchemy.dialects.postgresql as pg


class RoadmapOptionDict(TypedDict):
    id: int
    code: Optional[str] = None
    name: str
    question: int
    translations: Optional[List[dict]] = []
    order: Optional[int] = None


class RoadmapOption(Base):
    __tablename__ = "roadmap_option"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(Integer, ForeignKey('roadmap_question.id'))
    code = Column(String, nullable=True)
    name = Column(String)
    order = Column(Integer, nullable=True)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)

    def __init__(
        self, id: Optional[int], code: Optional[str],
        name: str, question: int, translations: Optional[List[dict]],
        order: Optional[int]
    ):
        self.id = id
        self.code = code
        self.name = name
        self.translations = translations
        self.question = question
        self.order = order

    def __repr__(self) -> int:
        return f"<RoadmapOption {self.id}>"

    @property
    def serialize(self) -> RoadmapOptionDict:
        translations = []
        if self.translations:
            translations = self.translations

        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "question": self.question,
            "translations": translations,
            "order": self.order
        }

    @property
    def optionName(self):
        return self.name

    @property
    def serializeJson(self):
        option = {
            "code": self.code,
            "name": self.name,
            "order": self.order,
        }
        if self.translations:
            option.update({"translations": self.translations})
        return option


class OptionBase(BaseModel):
    id: int
    question: int
    code: Optional[str] = None
    name: str
    translations: Optional[List[dict]] = []
    order: Optional[int] = None

    class Config:
        orm_mode = True


class OptionJson(BaseModel):
    code: Optional[str] = None
    name: str
    translations: Optional[List[dict]] = []
    order: Optional[int] = None

    class Config:
        orm_mode = True
