# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional, List
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy import Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base
from datetime import datetime
from models.question import QuestionBase
from models.question import QuestionPayload


class QuestionGroupPayload(TypedDict):
    form: int
    name: str
    description: Optional[str] = None
    translations: Optional[List[dict]] = None
    order: Optional[int] = None
    repeat: Optional[bool] = None
    repeat_text: Optional[str] = None
    member_access: Optional[List[int]] = None
    isco_access: Optional[List[int]] = None
    question: Optional[List[QuestionPayload]] = None


class QuestionGroupDict(TypedDict):
    id: int
    form: int
    name: str
    description: Optional[str] = None
    translations: Optional[List[dict]] = []
    order: Optional[int] = None
    repeat: bool
    repeat_text: Optional[str] = None


class QuestionGroup(Base):
    __tablename__ = "question_group"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    form = Column(Integer, ForeignKey('form.id'))
    name = Column(String)
    description = Column(Text, nullable=True)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    repeat = Column(Boolean, default=False)
    repeat_text = Column(String, nullable=True)
    order = Column(Integer, nullable=True)
    created = Column(DateTime, default=datetime.utcnow)
    member_access = relationship(
        "QuestionGroupMemberAccess",
        primaryjoin="QuestionGroupMemberAccess.question_group==\
        QuestionGroup.id",
        cascade="all, delete",
        passive_deletes=True,
        backref="question_group_member_access")
    isco_access = relationship(
        "QuestionGroupIscoAccess",
        primaryjoin="QuestionGroupIscoAccess.question_group==QuestionGroup.id",
        cascade="all, delete",
        passive_deletes=True,
        backref="question_group_isco_access")
    question = relationship(
        "Question",
        primaryjoin="Question.question_group==QuestionGroup.id",
        cascade="all, delete",
        passive_deletes=True,
        backref="question_group_detail")

    def __init__(self, id: Optional[int], form: int, name: str,
                 translations: Optional[List[dict]],
                 repeat: Optional[bool], order: Optional[int],
                 description: Optional[str], repeat_text: Optional[str]):
        self.id = id
        self.form = form
        self.name = name
        self.description = description
        self.translations = translations
        self.order = order
        self.repeat = repeat
        self.repeat_text = repeat_text

    def __repr__(self) -> int:
        return f"<QuestionGroup {self.id}>"

    @property
    def serialize(self) -> QuestionGroupDict:
        translations = []
        if self.translations:
            translations = self.translations

        return {
            "id": self.id,
            "form": self.form,
            "name": self.name,
            "description": self.description,
            "translations": translations,
            "order": self.order,
            "repeat": self.repeat,
            "repeat_text": self.repeat_text,
            "member_access": [ma.member_type for ma in self.member_access],
            "isco_access": [ia.isco_type for ia in self.isco_access],
            "question": [q.serialize for q in self.question]
        }

    @property
    def serializeJson(self):
        group = {
            "name": self.name,
            "description": self.description,
            "order": self.order,
            "repeatable": self.repeat,
            "member_access": [ma.memberName for ma in self.member_access],
            "isco_access": [ia.iscoName for ia in self.isco_access],
            "question": [q.serializeJson for q in self.question]
        }
        if self.repeat:
            group.update({"repeatButtonPlacement": "bottom"})
        if self.repeat and self.repeat_text:
            group.update({"repeatText": self.repeat_text})
        if self.translations:
            translations = []
            for lang in self.translations:
                tmp = {
                    "name": lang['name'],
                    "description": lang['description']
                }
                if self.repeat and self.repeat_text:
                    tmp.update({"repeatText": lang['repeat_text']})
                translations.append(tmp)
            group.update({"translations": translations})
        return group


class QuestionGroupBase(BaseModel):
    id: int
    form: int
    name: str
    description: Optional[str] = None
    translations: Optional[List[dict]] = []
    order: Optional[int] = None
    repeat: bool
    repeat_text: Optional[str] = None
    member_access: Optional[List[int]] = []
    isco_access: Optional[List[int]] = []
    question: Optional[List[QuestionBase]] = []

    class Config:
        orm_mode = True


class QuestionGroupJson(BaseModel):
    name: str
    description: Optional[str] = None
    translations: Optional[List[dict]] = []
    order: Optional[int] = None
    repeatable: bool
    repeatText: Optional[str] = None
    member_access: Optional[List[str]] = []
    isco_access: Optional[List[str]] = []
    question: Optional[List[dict]] = []

    class Config:
        orm_mode = True
