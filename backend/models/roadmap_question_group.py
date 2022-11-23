# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional, List
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text, BigInteger
from sqlalchemy import Boolean, DateTime
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base
from datetime import datetime
from models.roadmap_question import RoadmapQuestionBase, RoadmapQuestionJson


class RoadmapQuestionGroupDict(TypedDict):
    id: int
    name: str
    description: Optional[str] = None
    translations: Optional[List[dict]] = []
    order: Optional[int] = None
    repeat: bool
    repeat_text: Optional[str] = None


class RoadmapQuestionGroup(Base):
    __tablename__ = "roadmap_question_group"
    id = Column(BigInteger, primary_key=True, index=True, nullable=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    repeat = Column(Boolean, default=False)
    repeat_text = Column(String, nullable=True)
    order = Column(Integer, nullable=True)
    created = Column(DateTime, default=datetime.utcnow)
    question = relationship(
        "RoadmapQuestion",
        primaryjoin="RoadmapQuestion.question_group==RoadmapQuestionGroup.id",
        cascade="all, delete",
        passive_deletes=True,
        backref="roadmap_question_group_detail")

    def __init__(
        self, id: Optional[int], name: str,
        translations: Optional[List[dict]], repeat: Optional[bool],
        order: Optional[int], description: Optional[str],
        repeat_text: Optional[str]
    ):
        self.id = id
        self.name = name
        self.description = description
        self.translations = translations
        self.order = order
        self.repeat = repeat
        self.repeat_text = repeat_text

    def __repr__(self) -> int:
        return f"<RoadmapQuestionGroup {self.id}>"

    @property
    def serialize(self) -> RoadmapQuestionGroupDict:
        translations = []
        if self.translations:
            translations = self.translations

        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "translations": translations,
            "order": self.order,
            "repeat": self.repeat,
            "repeat_text": self.repeat_text,
            "question": [q.serialize for q in self.question]
        }

    @property
    def get_question_ids(self) -> List[int]:
        return [q.only_id for q in self.question]

    @property
    def serializeJson(self):
        print(self.question)
        group = {
            "name": self.name,
            "description": self.description,
            "order": self.order,
            "repeatable": self.repeat,
            "question": [q.serializeJson for q in self.question]
        }
        if self.repeat:
            group.update({"repeatButtonPlacement": "bottom"})
        if self.repeat and self.repeat_text:
            group.update({"repeatText": self.repeat_text})
        if self.translations:
            translations = []
            for lang in self.translations:
                tmp = {"language": lang['language']}
                if "name" in lang:
                    tmp.update({"name": lang['name']})
                if "description" in lang:
                    tmp.update({"description": lang['description']})
                if self.repeat and self.repeat_text and "repeat_text" in lang:
                    tmp.update({"repeatText": lang['repeat_text']})
                translations.append(tmp)
            group.update({"translations": translations})
        return group


class RoadmapQuestionGroupBase(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    translations: Optional[List[dict]] = []
    order: Optional[int] = None
    repeat: bool
    repeat_text: Optional[str] = None
    question: Optional[List[RoadmapQuestionBase]] = []

    class Config:
        orm_mode = True


class RoadmapQuestionGroupJson(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    translations: Optional[List[dict]] = []
    order: Optional[int] = None
    repeatable: bool
    repeatText: Optional[str] = None
    question: Optional[List[RoadmapQuestionJson]] = []

    class Config:
        orm_mode = True


class RoadmapFormJson(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    languages: Optional[List[str]] = None
    version: Optional[float] = None
    question_group: Optional[List[dict]] = []
    tree: Optional[dict] = None

    class Config:
        orm_mode = True
